import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { parseMarkdown, serializeToMarkdown } from '../lib/markdown'
import type { PageContent } from '../types/schemas'

export interface GitCMSConfig {
  getAccessToken: () => Promise<string | null>
  owner: string
  repo: string
}

export function createGitCMSHandler(config: GitCMSConfig) {
  return {
    GET: async (
      request: NextRequest,
      context: { params: Promise<{ path: string[] }> | { path: string[] } }
    ) => {
      const params = await context.params
      const accessToken = await config.getAccessToken()

      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const octokit = new Octokit({ auth: accessToken })
      const path = params.path?.join('/') || 'content/pages'

      try {
        const { data } = await octokit.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          path,
        })

        if (Array.isArray(data)) {
          // Directory listing
          return NextResponse.json(
            data.map((item) => ({
              name: item.name,
              path: item.path,
              type: item.type,
              sha: item.sha,
            }))
          )
        } else if ('content' in data) {
          // File content
          const content = Buffer.from(data.content, 'base64').toString('utf-8')
          const pageContent = content.trimStart().startsWith('---') ? parseMarkdown(content) : null
          return NextResponse.json({
            content,
            sha: data.sha,
            path: data.path,
            pageContent,
          })
        }

        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      } catch (error) {
        console.error('GitHub API error:', error)
        const status = (error as { status?: number })?.status
        // GitHub returns 404 for private repos with bad/missing token — treat as auth failure.
        // 401/403 are explicit auth errors.
        if (status === 401 || status === 403 || status === 404) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
      }
    },

    POST: async (
      request: NextRequest,
      context: { params: Promise<{ path: string[] }> | { path: string[] } }
    ) => {
      const accessToken = await config.getAccessToken()

      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const octokit = new Octokit({ auth: accessToken })
      const body = await request.json()
      const { path, content: rawContent, pageContent, message, sha } = body

      if (!path || (!rawContent && !pageContent) || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // If pageContent (schema-driven editor), serialize to markdown server-side
      const content: string = pageContent
        ? serializeToMarkdown(pageContent as PageContent)
        : rawContent

      try {
        await octokit.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
        })

        return NextResponse.json({ success: true })
      } catch (error) {
        console.error('GitHub API error:', error)
        const status = (error as { status?: number })?.status
        if (status === 401 || status === 403 || status === 404) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
      }
    },

    DELETE: async (
      request: NextRequest,
      context: { params: Promise<{ path: string[] }> | { path: string[] } }
    ) => {
      const accessToken = await config.getAccessToken()

      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const octokit = new Octokit({ auth: accessToken })
      const body = await request.json()
      const { path, sha, message } = body

      if (!path || !sha || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      try {
        await octokit.repos.deleteFile({
          owner: config.owner,
          repo: config.repo,
          path,
          message,
          sha,
        })

        return NextResponse.json({ success: true })
      } catch (error) {
        console.error('GitHub API error:', error)
        const status = (error as { status?: number })?.status
        if (status === 401 || status === 403 || status === 404) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
      }
    },
  }
}
