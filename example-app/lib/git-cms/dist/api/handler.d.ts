import { NextRequest, NextResponse } from 'next/server';
export interface GitCMSConfig {
    getAccessToken: () => Promise<string | null>;
    owner: string;
    repo: string;
}
export declare function createGitCMSHandler(config: GitCMSConfig): {
    GET: (request: NextRequest, context: {
        params: {
            path: string[];
        };
    }) => Promise<NextResponse<{
        error: string;
    }> | NextResponse<{
        name: string;
        path: string;
        type: "dir" | "file" | "submodule" | "symlink";
        sha: string;
    }[]> | NextResponse<{
        content: string;
        sha: string;
        path: string;
    }>>;
    POST: (request: NextRequest, context: {
        params: {
            path: string[];
        };
    }) => Promise<NextResponse<{
        error: string;
    }> | NextResponse<{
        success: boolean;
    }>>;
    DELETE: (request: NextRequest, context: {
        params: {
            path: string[];
        };
    }) => Promise<NextResponse<{
        error: string;
    }> | NextResponse<{
        success: boolean;
    }>>;
};
//# sourceMappingURL=handler.d.ts.map