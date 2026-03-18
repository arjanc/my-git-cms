import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { parseMarkdown, serializeToMarkdown } from '../lib/markdown';
// ─── Slug map helpers ─────────────────────────────────────────────────────────
/**
 * Derives the slug-map file path and the app-relative file path from a repo
 * file path.
 *
 * Examples (contentBase = 'example-app'):
 *   filePath: 'example-app/content/pages/team.md'
 *   → slugMapRepoPath: 'example-app/content/slug-map.json'
 *   → fileRelPath:     'content/pages/team.md'
 *
 * Examples (no contentBase — app at repo root):
 *   filePath: 'content/pages/team.md'
 *   → slugMapRepoPath: 'content/slug-map.json'
 *   → fileRelPath:     'content/pages/team.md'
 */
function getSlugMapInfo(filePath) {
    const segments = filePath.split('/');
    const contentIdx = segments.indexOf('content');
    if (contentIdx === -1)
        return null;
    return {
        slugMapRepoPath: [...segments.slice(0, contentIdx + 1), 'slug-map.json'].join('/'),
        fileRelPath: segments.slice(contentIdx).join('/'),
    };
}
async function readSlugMapFromGitHub(octokit, owner, repo, slugMapPath) {
    try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: slugMapPath });
        if (!Array.isArray(data) && 'content' in data) {
            const map = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
            return { map, sha: data.sha };
        }
    }
    catch {
        // File doesn't exist yet
    }
    return { map: {}, sha: undefined };
}
async function writeSlugMapToGitHub(octokit, owner, repo, slugMapPath, map, sha, message) {
    const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: slugMapPath,
        message,
        content: Buffer.from(JSON.stringify(sorted, null, 2) + '\n').toString('base64'),
        sha,
    });
}
/**
 * Adds or updates a slug → file mapping. Also removes any stale entries
 * that previously pointed to the same file (handles slug renames).
 */
async function upsertSlugEntry(octokit, owner, repo, slugMapPath, slug, fileRelPath) {
    const { map, sha } = await readSlugMapFromGitHub(octokit, owner, repo, slugMapPath);
    // Remove stale entries for this file (in case the slug changed)
    const cleaned = Object.fromEntries(Object.entries(map).filter(([, v]) => v !== fileRelPath));
    cleaned[slug] = fileRelPath;
    // Skip write if nothing changed
    if (JSON.stringify(cleaned) === JSON.stringify(map))
        return;
    await writeSlugMapToGitHub(octokit, owner, repo, slugMapPath, cleaned, sha, `slug-map: ${slug}`);
}
/** Removes the entry for a deleted file from the slug map. */
async function removeSlugEntry(octokit, owner, repo, slugMapPath, fileRelPath) {
    const { map, sha } = await readSlugMapFromGitHub(octokit, owner, repo, slugMapPath);
    const updated = Object.fromEntries(Object.entries(map).filter(([, v]) => v !== fileRelPath));
    if (Object.keys(updated).length === Object.keys(map).length)
        return; // nothing to remove
    await writeSlugMapToGitHub(octokit, owner, repo, slugMapPath, updated, sha, `slug-map: remove ${fileRelPath}`);
}
export function createGitCMSHandler(config) {
    return {
        GET: async (request, context) => {
            const params = await context.params;
            const accessToken = await config.getAccessToken();
            if (!accessToken) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const octokit = new Octokit({ auth: accessToken });
            const path = params.path?.join('/') || 'content/pages';
            try {
                const { data } = await octokit.repos.getContent({
                    owner: config.owner,
                    repo: config.repo,
                    path,
                });
                if (Array.isArray(data)) {
                    // Directory listing
                    return NextResponse.json(data.map((item) => ({
                        name: item.name,
                        path: item.path,
                        type: item.type,
                        sha: item.sha,
                    })));
                }
                else if ('content' in data) {
                    // File content
                    const content = Buffer.from(data.content, 'base64').toString('utf-8');
                    const pageContent = content.trimStart().startsWith('---') ? parseMarkdown(content) : null;
                    return NextResponse.json({
                        content,
                        sha: data.sha,
                        path: data.path,
                        pageContent,
                    });
                }
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            catch (error) {
                console.error('GitHub API error:', error);
                const status = error?.status;
                if (status === 401 || status === 403) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                if (status === 404) {
                    // We already confirmed a token exists above, so this is a genuine not-found:
                    // directory → return empty list so the CMS can show an empty state;
                    // file (has extension) → return 404 so the editor knows the file is gone.
                    const lastSegment = path.split('/').pop() ?? '';
                    if (lastSegment.includes('.')) {
                        return NextResponse.json({ error: 'Not found' }, { status: 404 });
                    }
                    return NextResponse.json([], { status: 200 });
                }
                return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
            }
        },
        POST: async (request, context) => {
            const accessToken = await config.getAccessToken();
            if (!accessToken) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const octokit = new Octokit({ auth: accessToken });
            const body = await request.json();
            const { path, content: rawContent, pageContent, message, sha, encoding = 'utf-8' } = body;
            if (!path || (!rawContent && !pageContent) || !message) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }
            // add metadata to pageContent
            if (pageContent) {
                try {
                    const { data: user } = await octokit.users.getAuthenticated();
                    const author = user.name || user.login;
                    pageContent.metadata = {
                        createdAt: pageContent.metadata?.createdAt ?? new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        author,
                    };
                }
                catch (error) {
                    console.error('Failed to fetch authenticated user for metadata:', error);
                    // Fallback if user fetch fails but we still want to save
                    pageContent.metadata = {
                        createdAt: pageContent.metadata?.createdAt ?? new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        author: 'Anonymous',
                    };
                }
            }
            console.log('handler POST: ', pageContent);
            // If pageContent (schema-driven editor), serialize to markdown server-side
            const content = pageContent
                ? serializeToMarkdown(pageContent)
                : rawContent;
            try {
                const { data: writeData } = await octokit.repos.createOrUpdateFileContents({
                    owner: config.owner,
                    repo: config.repo,
                    path,
                    message,
                    content: encoding === 'base64' ? content : Buffer.from(content).toString('base64'),
                    sha,
                });
                const savedSha = writeData.content?.sha;
                // Maintain the slug map — non-critical, errors must not fail the save
                if (pageContent?.slug) {
                    const info = getSlugMapInfo(path);
                    if (info) {
                        upsertSlugEntry(octokit, config.owner, config.repo, info.slugMapRepoPath, pageContent.slug, info.fileRelPath)
                            .catch((err) => console.error('slug-map update failed:', err));
                    }
                }
                return NextResponse.json({ success: true, sha: savedSha });
            }
            catch (error) {
                console.error('GitHub API error:', error);
                const status = error?.status;
                if (status === 401 || status === 403 || status === 404) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
            }
        },
        DELETE: async (request, context) => {
            const accessToken = await config.getAccessToken();
            if (!accessToken) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const octokit = new Octokit({ auth: accessToken });
            const body = await request.json();
            const { path, sha, message } = body;
            if (!path || !sha || !message) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }
            try {
                await octokit.repos.deleteFile({
                    owner: config.owner,
                    repo: config.repo,
                    path,
                    message,
                    sha,
                });
                // Maintain the slug map — non-critical, errors must not fail the delete
                const info = getSlugMapInfo(path);
                if (info) {
                    removeSlugEntry(octokit, config.owner, config.repo, info.slugMapRepoPath, info.fileRelPath)
                        .catch((err) => console.error('slug-map remove failed:', err));
                }
                return NextResponse.json({ success: true });
            }
            catch (error) {
                console.error('GitHub API error:', error);
                const status = error?.status;
                if (status === 401 || status === 403 || status === 404) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
            }
        },
    };
}
