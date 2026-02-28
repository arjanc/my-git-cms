import { NextResponse } from 'next/server';
import { handlers, auth } from '../auth';
import { createGitCMSHandler } from '../api/handler';
// Adapt the catch-all params into the shape handler.ts expects: { path: string[] }
function cmsContext(segments) {
    return { params: Promise.resolve({ path: segments }) };
}
// Create a handler with the resolved access token for the current request.
// auth() must be called at the route-handler level so next-auth can read the
// session cookie via next/headers in the correct request context.
function makeCmsHandler(accessToken) {
    return createGitCMSHandler({
        getAccessToken: async () => accessToken,
        owner: process.env.GITHUB_OWNER ?? '',
        repo: process.env.GITHUB_REPO ?? '',
    });
}
export async function GET(request, context) {
    const { cms = [] } = await context.params;
    // /admin/api/auth/** → NextAuth (uses request.url + basePath to determine action)
    if (cms[0] === 'auth') {
        return handlers.GET(request);
    }
    // /admin/api/cms/** → GitHub file operations; strip the leading 'cms' segment
    if (cms[0] === 'cms') {
        const session = await auth();
        return makeCmsHandler(session?.accessToken ?? null).GET(request, cmsContext(cms.slice(1)));
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
export async function POST(request, context) {
    const { cms = [] } = await context.params;
    if (cms[0] === 'auth') {
        return handlers.POST(request);
    }
    if (cms[0] === 'cms') {
        const session = await auth();
        return makeCmsHandler(session?.accessToken ?? null).POST(request, cmsContext(cms.slice(1)));
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
export async function DELETE(request, context) {
    const { cms = [] } = await context.params;
    if (cms[0] === 'cms') {
        const session = await auth();
        return makeCmsHandler(session?.accessToken ?? null).DELETE(request, cmsContext(cms.slice(1)));
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
