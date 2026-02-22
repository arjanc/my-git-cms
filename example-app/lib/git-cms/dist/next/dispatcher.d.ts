import { NextRequest } from 'next/server';
type RouteContext = {
    params: Promise<{
        cms?: string[];
    }>;
};
export declare function GET(request: NextRequest, context: RouteContext): Promise<Response>;
export declare function POST(request: NextRequest, context: RouteContext): Promise<Response>;
export declare function DELETE(request: NextRequest, context: RouteContext): Promise<Response>;
export {};
//# sourceMappingURL=dispatcher.d.ts.map