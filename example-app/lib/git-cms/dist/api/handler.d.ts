import { NextRequest, NextResponse } from 'next/server';
import type { PageContent } from '../types/schemas';
export interface GitCMSConfig {
    getAccessToken: () => Promise<string | null>;
    owner: string;
    repo: string;
}
export declare function createGitCMSHandler(config: GitCMSConfig): {
    GET: (request: NextRequest, context: {
        params: Promise<{
            path: string[];
        }> | {
            path: string[];
        };
    }) => Promise<NextResponse<{
        error: string;
    }> | NextResponse<{
        name: string;
        path: string;
        type: "file" | "dir" | "submodule" | "symlink";
        sha: string;
    }[]> | NextResponse<{
        content: string;
        sha: string;
        path: string;
        pageContent: PageContent | null;
    }>>;
    POST: (request: NextRequest, context: {
        params: Promise<{
            path: string[];
        }> | {
            path: string[];
        };
    }) => Promise<NextResponse<{
        error: string;
    }> | NextResponse<{
        success: boolean;
    }>>;
    DELETE: (request: NextRequest, context: {
        params: Promise<{
            path: string[];
        }> | {
            path: string[];
        };
    }) => Promise<NextResponse<{
        error: string;
    }> | NextResponse<{
        success: boolean;
    }>>;
};
//# sourceMappingURL=handler.d.ts.map