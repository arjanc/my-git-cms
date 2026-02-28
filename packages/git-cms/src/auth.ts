import NextAuth from "next-auth"
import type { NextAuthConfig, NextAuthResult, Session } from "next-auth"
import GitHub from "next-auth/providers/github"

// Type-only — erased at compile time, no runtime side effect
import type {} from "next-auth/jwt"

// Module augmentation for next-auth to add accessToken
declare module "next-auth" {
    interface Session {
        accessToken?: string
    }
}

// Module augmentation for next-auth/jwt to add accessToken
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
    }
}

const BASE_PATH = process.env.GIT_CMS_BASE_PATH ?? '/admin'

const config: NextAuthConfig = {
    basePath: `${BASE_PATH}/api/auth`,
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'repo read:user user:email',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            return session
        },
    },
}

const result: NextAuthResult = NextAuth(config)

export const handlers: NextAuthResult["handlers"] = result.handlers
export const signIn: NextAuthResult["signIn"] = result.signIn
export const signOut: NextAuthResult["signOut"] = result.signOut
export const auth: NextAuthResult["auth"] = result.auth