declare const GET: (request: import("next/server").NextRequest, context: {
    params: Promise<{
        path: string[];
    }> | {
        path: string[];
    };
}) => Promise<import("next/server").NextResponse<{
    error: string;
}> | import("next/server").NextResponse<{
    name: string;
    path: string;
    type: "dir" | "file" | "submodule" | "symlink";
    sha: string;
}[]> | import("next/server").NextResponse<{
    content: string;
    sha: string;
    path: string;
}>>, POST: (request: import("next/server").NextRequest, context: {
    params: Promise<{
        path: string[];
    }> | {
        path: string[];
    };
}) => Promise<import("next/server").NextResponse<{
    error: string;
}> | import("next/server").NextResponse<{
    success: boolean;
}>>, DELETE: (request: import("next/server").NextRequest, context: {
    params: Promise<{
        path: string[];
    }> | {
        path: string[];
    };
}) => Promise<import("next/server").NextResponse<{
    error: string;
}> | import("next/server").NextResponse<{
    success: boolean;
}>>;
export { GET, POST, DELETE };
//# sourceMappingURL=admin-api-route.d.ts.map