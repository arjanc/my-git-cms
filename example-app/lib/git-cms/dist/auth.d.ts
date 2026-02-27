import type { NextAuthResult } from "next-auth";
import "next-auth/jwt";
declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
    }
}
export declare const handlers: NextAuthResult["handlers"];
export declare const signIn: NextAuthResult["signIn"];
export declare const signOut: NextAuthResult["signOut"];
export declare const auth: NextAuthResult["auth"];
//# sourceMappingURL=auth.d.ts.map