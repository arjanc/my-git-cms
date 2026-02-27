import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// Import JWT to ensure the module is available for augmentation
import "next-auth/jwt";
const config = {
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
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
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
};
const result = NextAuth(config);
export const handlers = result.handlers;
export const signIn = result.signIn;
export const signOut = result.signOut;
export const auth = result.auth;
