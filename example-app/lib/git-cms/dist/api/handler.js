import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
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
                    return NextResponse.json({
                        content,
                        sha: data.sha,
                        path: data.path,
                    });
                }
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            catch (error) {
                console.error('GitHub API error:', error);
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
            const { path, content, message, sha } = body;
            if (!path || !content || !message) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }
            try {
                await octokit.repos.createOrUpdateFileContents({
                    owner: config.owner,
                    repo: config.repo,
                    path,
                    message,
                    content: Buffer.from(content).toString('base64'),
                    sha,
                });
                return NextResponse.json({ success: true });
            }
            catch (error) {
                console.error('GitHub API error:', error);
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
                return NextResponse.json({ success: true });
            }
            catch (error) {
                console.error('GitHub API error:', error);
                return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
            }
        },
    };
}
