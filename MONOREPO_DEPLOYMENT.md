# Monorepo Deployment Guide: Single Vercel Project with /admin Route

## Overview

Deploy both apps on a single Vercel project where:
- Root (`/`) → Web App (public website)
- `/admin` → CMS App (admin interface)

## Recommended Approach: Next.js Rewrites (Best for Future Package)

This approach keeps the apps separate but routes them together, making it easy to extract CMS as a package later.

### Architecture

```
git-cms-monorepo/
├── packages/
│   ├── cms-app/          # Admin CMS (future npm package)
│   │   ├── app/
│   │   ├── components/
│   │   ├── package.json
│   │   └── next.config.js
│   └── shared/           # Shared types (future npm package)
│       ├── block-types.ts
│       └── package.json
├── web-app/              # Public website (Vercel root)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── next.config.js
├── package.json          # Root package.json (workspace)
└── vercel.json          # Vercel configuration
```

### Implementation

#### 1. Create Root `package.json` (Workspace Configuration)

```json
{
  "name": "git-cms-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "web-app",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=web-app & npm run dev --workspace=packages/cms-app",
    "dev:web": "npm run dev --workspace=web-app",
    "dev:admin": "npm run dev --workspace=packages/cms-app",
    "build": "npm run build --workspace=packages/cms-app && npm run build --workspace=web-app",
    "build:web": "npm run build --workspace=web-app",
    "build:admin": "npm run build --workspace=packages/cms-app"
  }
}
```

#### 2. Update CMS App `package.json`

Move `cms-app/package.json`:

```json
{
  "name": "@git-cms/admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001"
  },
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@git-cms/shared": "*",
    "next-auth": "^5.0.0-beta.25",
    "@octokit/rest": "^21.0.2",
    // ... rest of dependencies
  }
}
```

#### 3. Create Shared Package

```json
// packages/shared/package.json
{
  "name": "@git-cms/shared",
  "version": "1.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    "./block-types": "./block-types.ts",
    "./markdown-utils": "./markdown-utils.ts"
  }
}
```

```typescript
// packages/shared/index.ts
export * from './block-types'
export * from './markdown-utils'
```

#### 4. Update Web App `package.json`

```json
{
  "name": "git-cms-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@git-cms/shared": "*",
    "gray-matter": "^4.0.3"
  }
}
```

#### 5. Configure Next.js Rewrites in Web App

```javascript
// web-app/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: 'http://localhost:3001/admin',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:3001/admin/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

For production, update to use the built CMS app:

```javascript
// web-app/next.config.js
const isProd = process.env.NODE_ENV === 'production'
const CMS_URL = isProd 
  ? 'https://your-domain.com' 
  : 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: `${CMS_URL}/admin`,
      },
      {
        source: '/admin/:path*',
        destination: `${CMS_URL}/admin/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
```

#### 6. Update CMS App Base Path

```javascript
// packages/cms-app/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

#### 7. Update CMS App Routes

Since we're using `/admin` as basePath, update your routes:

```typescript
// packages/cms-app/middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnEditor = req.nextUrl.pathname.startsWith('/admin/editor')
  const isOnDashboard = req.nextUrl.pathname === '/admin' || req.nextUrl.pathname === '/admin/'

  if ((isOnDashboard || isOnEditor) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

Update auth configuration:

```typescript
// packages/cms-app/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
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
  basePath: '/admin/api/auth',
  pages: {
    signIn: '/admin/auth/signin',
  },
})
```

#### 8. Create `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "web-app/.next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "builds": [
    {
      "src": "web-app/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "packages/cms-app/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "/packages/cms-app/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/web-app/$1"
    }
  ]
}
```

#### 9. Update Import Paths

In both apps, update imports to use workspace packages:

```typescript
// Before
import { Block, PageContent } from '../../../shared/block-types'

// After
import { Block, PageContent } from '@git-cms/shared/block-types'
```

#### 10. Update GitHub OAuth Callback URL

Update to include `/admin` prefix:
- Development: `http://localhost:3000/admin/api/auth/callback/github`
- Production: `https://your-domain.com/admin/api/auth/callback/github`

### Development Workflow

```bash
# Install dependencies
npm install

# Run both apps
npm run dev

# Or run individually
npm run dev:web    # Runs on :3000
npm run dev:admin  # Runs on :3001

# Access apps
# Web:   http://localhost:3000
# Admin: http://localhost:3000/admin (rewrites to :3001)
```

### Build & Deploy

```bash
# Build all packages
npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables in Vercel

Set these in your Vercel project:

```env
# CMS Admin Auth
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_SECRET=...

# Optional: different secrets for web/admin
WEB_ENV_VAR=...
ADMIN_ENV_VAR=...
```

## Alternative Approach: Fully Integrated (Not Recommended)

If you want everything in one Next.js app:

### Structure

```
web-app/
├── app/
│   ├── (public)/       # Public routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── admin/          # Admin routes
│       ├── layout.tsx
│       ├── page.tsx
│       └── editor/
├── components/
│   ├── public/
│   └── admin/
└── package.json
```

### Implementation

```typescript
// web-app/app/(public)/layout.tsx
export default function PublicLayout({ children }) {
  return <>{children}</>
}

// web-app/app/admin/layout.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }
  
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
```

**Cons of this approach:**
- ❌ Can't easily extract CMS as separate package
- ❌ Larger bundle (includes both apps)
- ❌ Harder to maintain separate concerns
- ❌ More complex build configuration

## Comparison Table

| Feature | Separate Apps + Rewrites | Fully Integrated |
|---------|-------------------------|------------------|
| **Future Package** | ✅ Easy | ❌ Very difficult |
| **Independent Deploy** | ✅ Yes | ❌ No |
| **Bundle Size** | ✅ Smaller (split) | ❌ Larger (combined) |
| **Development** | ✅ Run independently | ⚠️ Single dev server |
| **Maintenance** | ✅ Clear separation | ❌ Mixed concerns |
| **Complexity** | ⚠️ Medium | ✅ Simple |
| **Vercel Setup** | ⚠️ Requires config | ✅ Standard |

## Migration Path to NPM Package

When ready to publish CMS as package:

### 1. Update CMS Package

```json
// packages/cms-app/package.json
{
  "name": "@your-org/git-cms",
  "version": "1.0.0",
  "private": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0"
  }
}
```

### 2. Create Entry Point

```typescript
// packages/cms-app/src/index.ts
export { CMS } from './components/cms'
export type { CMSConfig } from './types'
```

### 3. Publish

```bash
cd packages/cms-app
npm version patch
npm publish
```

### 4. Use in Projects

```bash
npm install @your-org/git-cms
```

```typescript
// In any Next.js app
import { CMS } from '@your-org/git-cms'

export default function AdminPage() {
  return <CMS config={{ /* ... */ }} />
}
```

## Recommended Setup (Step-by-Step)

1. **Restructure files:**
   ```bash
   mkdir -p packages/cms-app packages/shared
   mv cms-app/* packages/cms-app/
   mv shared/* packages/shared/
   ```

2. **Create workspace:**
   - Create root `package.json` with workspaces
   - Update package names with scopes

3. **Configure Next.js:**
   - Add basePath to CMS
   - Add rewrites to Web App

4. **Update imports:**
   - Change to workspace package imports

5. **Test locally:**
   ```bash
   npm install
   npm run dev
   ```

6. **Deploy:**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Issue: Rewrites not working

**Solution:** Check that ports match in `next.config.js` and both apps are running.

### Issue: Auth callback failing

**Solution:** Update GitHub OAuth callback URL to include `/admin` prefix.

### Issue: Shared package not found

**Solution:** Run `npm install` at root level to link workspace packages.

### Issue: Different Node versions

**Solution:** Add `.nvmrc` at root:
```
20.11.0
```

## Summary

**Best approach:** Separate apps with rewrites
- ✅ Keeps apps independent
- ✅ Easy to extract as package
- ✅ Clear separation of concerns
- ✅ Production-ready

This gives you the best of both worlds: unified deployment with independent codebases.
