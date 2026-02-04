# Migration Guide: Pages Router (v1) to App Router (v2)

This guide helps you migrate from the Pages Router version (Next.js 14) to the App Router version (Next.js 15).

## Overview of Changes

| Feature | v1 (Pages Router) | v2 (App Router) |
|---------|------------------|-----------------|
| Next.js | 14.x | 15.1+ |
| React | 18.x | 19.0+ |
| NextAuth | 4.x | 5.0+ |
| Tailwind | 3.3 | 3.4 |
| TypeScript | 5.2 | 5.7 |
| Router | Pages Router | App Router |

## Step-by-Step Migration

### 1. Update Dependencies

**package.json changes:**

```diff
{
  "dependencies": {
-   "next": "^14.0.0",
+   "next": "^15.1.3",
-   "react": "^18.2.0",
+   "react": "^19.0.0",
-   "react-dom": "^18.2.0",
+   "react-dom": "^19.0.0",
-   "next-auth": "^4.24.0",
+   "next-auth": "^5.0.0-beta.25",
-   "@octokit/rest": "^20.0.0",
+   "@octokit/rest": "^21.0.2",
-   "tailwindcss": "^3.3.5",
+   "tailwindcss": "^3.4.17",
-   "typescript": "^5.2.0"
+   "typescript": "^5.7.2"
  }
}
```

Install new dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Migrate File Structure

Move files from `pages/` to `app/`:

```bash
# Create new app directory
mkdir -p app

# Move and rename files
mv pages/_app.tsx app/layout.tsx
mv pages/index.tsx app/page.tsx
mv styles/globals.css app/globals.css
```

**pages/_app.tsx → app/layout.tsx**

```typescript
// Old: pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

// New: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Git CMS",
  description: "Git-based content management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 3. Update NextAuth Configuration

**Old: pages/api/auth/[...nextauth].ts**

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
};

export default NextAuth(authOptions);
```

**New: auth.ts (root level)**

```typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
})
```

**New: app/api/auth/[...nextauth]/route.ts**

```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

### 4. Update Environment Variables

**Old (.env.local):**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
```

**New (.env.local):**
```env
AUTH_SECRET=your_secret
AUTH_GITHUB_ID=your_id
AUTH_GITHUB_SECRET=your_secret
```

### 5. Update Authentication Usage

**Old: Client-side (Pages Router)**

```typescript
import { useSession, signIn, signOut } from 'next-auth/react'

function Component() {
  const { data: session } = useSession()
  
  return (
    <button onClick={() => signIn('github')}>
      Sign in
    </button>
  )
}
```

**New: Server Component (App Router)**

```typescript
import { auth, signIn } from '@/auth'

export default async function Component() {
  const session = await auth()
  
  return (
    <form action={async () => {
      "use server"
      await signIn("github")
    }}>
      <button type="submit">Sign in</button>
    </form>
  )
}
```

**New: Client Component (App Router)**

```typescript
"use client"

import { signOut } from "next-auth/react"

export function Component() {
  return (
    <button onClick={() => signOut()}>
      Sign out
    </button>
  )
}
```

### 6. Migrate Pages to App Router

**Old: pages/editor/[owner]/[repo].tsx**

```typescript
import { useRouter } from 'next/router'

export default function EditorPage() {
  const router = useRouter()
  const { owner, repo } = router.query
  
  return <div>Editor</div>
}
```

**New: app/editor/[owner]/[repo]/page.tsx**

```typescript
export default function EditorPage({
  params,
}: {
  params: { owner: string; repo: string }
}) {
  return <div>Editor</div>
}
```

### 7. Update API Routes

**Old: pages/api/repos.ts**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // ... handle request
}
```

**New: app/api/repos/route.ts**

```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... handle request
}
```

### 8. Add Middleware for Auth

**New: middleware.ts (root level)**

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtected = req.nextUrl.pathname.startsWith('/editor')

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 9. Update Tailwind Config

**Old: tailwind.config.js**

```javascript
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  // ...
}
```

**New: tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  // ...
};

export default config;
```

### 10. Update TypeScript Config

**Old: tsconfig.json**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**New: tsconfig.json**

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

### 11. Convert Components to Server Components

**General rule:** Make components Server Components by default, only add `"use client"` when needed.

**Client Component indicators:**
- Uses React hooks (useState, useEffect, etc.)
- Uses event handlers (onClick, onChange, etc.)
- Uses browser APIs (localStorage, window, etc.)
- Uses context providers

**Example:**

```typescript
// Server Component (no "use client" needed)
export default async function Page() {
  const data = await fetchData() // Can fetch directly
  return <div>{data}</div>
}

// Client Component (needs "use client")
"use client"

import { useState } from 'react'

export default function Page() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 12. Update Data Fetching

**Old: getServerSideProps**

```typescript
export async function getServerSideProps() {
  const data = await fetchData()
  return { props: { data } }
}

export default function Page({ data }) {
  return <div>{data}</div>
}
```

**New: Server Component**

```typescript
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### 13. Testing the Migration

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Check for errors:**
   - Look for console errors
   - Test authentication flow
   - Test all routes
   - Test API endpoints

3. **Verify functionality:**
   - Sign in works
   - Dashboard loads
   - Editor works
   - Saving works
   - File listing works

### 14. Common Issues

**Issue: "use client" required**

```
Error: useState is not defined
```

**Solution:** Add `"use client"` at the top of the file.

---

**Issue: Session not working**

```
Error: Session is undefined
```

**Solution:** Check environment variables are named correctly (`AUTH_*` not `NEXTAUTH_*`)

---

**Issue: API routes not found**

```
Error: 404 on /api/repos
```

**Solution:** Ensure route.ts files are in correct location:
- `app/api/repos/route.ts` (not `pages/api/repos.ts`)

---

**Issue: Middleware not protecting routes**

```
Can access /editor without login
```

**Solution:** Check middleware.ts is in root directory and matcher is correct.

## Rollback Plan

If migration fails, you can rollback:

```bash
git checkout pages-router-version
npm install
npm run dev
```

## Benefits After Migration

✅ **Better Performance** - Server Components reduce bundle size  
✅ **Simpler Auth** - Server Actions for authentication  
✅ **Type Safety** - Better TypeScript inference  
✅ **Streaming** - Progressive rendering with Suspense  
✅ **Layouts** - Shared UI without re-renders  
✅ **Future Proof** - App Router is the future of Next.js  

## Support

If you run into issues during migration:
1. Check the console for specific errors
2. Review Next.js 15 documentation
3. Check NextAuth v5 migration guide
4. Open a GitHub issue with details

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [NextAuth v5 Docs](https://authjs.dev/getting-started/migrating-to-v5)
- [React 19 Docs](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS 3.4](https://tailwindcss.com/blog/tailwindcss-v3-4)
