import { NextRequest, NextResponse } from 'next/server'
import { handlers } from '../auth'
import { createGitCMSHandler } from '../api/handler'
import { auth } from '../auth'

// Pre-wired CMS handler reads owner/repo from env at module load time.
// getAccessToken is a closure — called per-request, never stale.
const cmsHandler = createGitCMSHandler({
  getAccessToken: async () => {
    const session = await auth()
    return session?.accessToken ?? null
  },
  owner: process.env.GITHUB_OWNER ?? '',
  repo: process.env.GITHUB_REPO ?? '',
})

type RouteContext = { params: Promise<{ cms?: string[] }> }

// Adapt the catch-all params into the shape handler.ts expects: { path: string[] }
function cmsContext(segments: string[]): { params: Promise<{ path: string[] }> } {
  return { params: Promise.resolve({ path: segments }) }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  const { cms = [] } = await context.params

  // /admin/api/auth/** → NextAuth (uses request.url + basePath to determine action)
  if (cms[0] === 'auth') {
    return handlers.GET(request)
  }

  // /admin/api/cms/** → GitHub file operations; strip the leading 'cms' segment
  if (cms[0] === 'cms') {
    return cmsHandler.GET(request, cmsContext(cms.slice(1)))
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  const { cms = [] } = await context.params

  if (cms[0] === 'auth') {
    return handlers.POST(request)
  }

  if (cms[0] === 'cms') {
    return cmsHandler.POST(request, cmsContext(cms.slice(1)))
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  const { cms = [] } = await context.params

  if (cms[0] === 'cms') {
    return cmsHandler.DELETE(request, cmsContext(cms.slice(1)))
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
