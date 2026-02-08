# Setup Guide - Git CMS Package

## Quick Start (5 minutes)

### 1. Create Your Next.js App

```bash
npx create-next-app@latest my-website
cd my-website
```

### 2. Install Git CMS

**Local development (before publishing):**

```bash
# Add to package.json
{
  "dependencies": {
    "@git-cms/core": "file:../git-cms-package/packages/git-cms"
  }
}

npm install
```

**Or after publishing to npm:**

```bash
npm install @git-cms/core
```

### 3. Add CMS Admin Page

Create `app/admin/page.tsx`:

```typescript
import { CMS } from '@git-cms/core'

export default function AdminPage() {
  return <CMS />
}
```

### 4. Add API Routes

Create `app/api/cms/[...path]/route.ts`:

```typescript
import { createGitCMSHandler } from '@git-cms/core/api'
import { auth } from '@/auth'

export const { GET, POST, DELETE } = createGitCMSHandler({
  getAccessToken: async () => {
    const session = await auth()
    return session?.accessToken || null
  },
  owner: process.env.GITHUB_OWNER!,
  repo: process.env.GITHUB_REPO!,
})
```

### 5. Set Up NextAuth

Create `auth.ts`:

```typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

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
})
```

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### 6. Configure Environment Variables

Create `.env.local`:

```env
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_secret
AUTH_SECRET=run_openssl_rand_base64_32
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
```

### 7. Run Development Server

```bash
npm run dev
```

Visit:
- Your site: `http://localhost:3000`
- CMS Admin: `http://localhost:3000/admin`

## Detailed Setup

### GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: My Website CMS
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Save Client ID and Client Secret

### Content Directory Structure

Create your content directory:

```bash
mkdir -p content/pages
```

Add example content `content/pages/home.md`:

```markdown
---
title: Home
slug: /
blocks:
  - id: block_1
    type: hero
    heading: Welcome to My Site
    subheading: Built with Git CMS
---
```

### Rendering Content in Your App

Create a page to render content `app/[...slug]/page.tsx`:

```typescript
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { parseMarkdown } from '@git-cms/core'
import { BlockRenderer } from '@/components/BlockRenderer'

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = params.slug ? `/${params.slug.join('/')}` : '/'
  
  // Find matching markdown file
  const contentDir = join(process.cwd(), 'content/pages')
  const files = readdirSync(contentDir)
  
  for (const file of files) {
    const content = readFileSync(join(contentDir, file), 'utf-8')
    const page = parseMarkdown(content)
    
    if (page.slug === slug) {
      return (
        <main>
          {page.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </main>
      )
    }
  }
  
  return <div>Page not found</div>
}
```

Create `components/BlockRenderer.tsx`:

```typescript
import type { Block } from '@git-cms/core'

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return (
        <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-6xl font-bold">{block.heading}</h1>
            {block.subheading && (
              <p className="text-2xl mt-4">{block.subheading}</p>
            )}
          </div>
        </section>
      )
    // Add other block types...
    default:
      return null
  }
}
```

## Local Package Development

### Building the Package

```bash
cd packages/git-cms
npm install
npm run build    # One-time build
# or
npm run dev      # Watch mode
```

### Using Local Package

In your app's `package.json`:

```json
{
  "dependencies": {
    "@git-cms/core": "file:../git-cms-package/packages/git-cms"
  }
}
```

Then:

```bash
npm install
```

### After Making Changes

1. Rebuild the package:
   ```bash
   cd packages/git-cms
   npm run build
   ```

2. Reinstall in your app:
   ```bash
   cd your-app
   rm -rf node_modules/@git-cms
   npm install
   ```

## Deployment to Vercel

### 1. Prepare for Deployment

**If using local package:**

Build the package first:

```bash
cd packages/git-cms
npm run build
```

**If publishing to npm:**

```bash
cd packages/git-cms
npm publish
```

Then update your app to use the npm version.

### 2. Push to GitHub

```bash
git add .
git commit -m "Add Git CMS"
git push
```

### 3. Deploy to Vercel

#### Via Vercel Dashboard:

1. Go to https://vercel.com
2. Import your repository
3. Add environment variables:
   - `AUTH_GITHUB_ID`
   - `AUTH_GITHUB_SECRET`
   - `AUTH_SECRET`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
4. Deploy!

#### Via CLI:

```bash
npm i -g vercel
vercel
```

### 4. Update GitHub OAuth Callback

Update your GitHub OAuth app callback URL to:

```
https://your-domain.vercel.app/api/auth/callback/github
```

## Troubleshooting

### Issue: Package not found

**Using file: protocol:**

```bash
# Make sure package is built
cd packages/git-cms
npm run build

# Reinstall in app
cd your-app
rm -rf node_modules
npm install
```

### Issue: Types not found

Make sure TypeScript is configured:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "paths": {
      "@git-cms/core": ["./node_modules/@git-cms/core/dist"]
    }
  }
}
```

### Issue: Vercel deployment fails

**If using file: protocol:**

You can't deploy with `file:` - you need to either:

1. **Publish to npm** (recommended for production)
2. **Copy package to your app:**
   ```bash
   cp -r packages/git-cms node_modules/@git-cms/core
   ```
3. **Use a private npm registry**

**Recommended: Publish to npm before deploying to Vercel**

## Publishing to npm

### 1. Prepare Package

```bash
cd packages/git-cms
```

Update `package.json`:

```json
{
  "name": "@your-org/git-cms",
  "version": "1.0.0",
  "description": "Git-based CMS for Next.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/git-cms"
  },
  "keywords": ["cms", "nextjs", "git", "markdown"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 2. Build

```bash
npm run build
```

### 3. Test Locally

```bash
npm pack
# Creates git-cms-0.1.0.tgz

# Test in another project
cd your-app
npm install ../packages/git-cms/git-cms-0.1.0.tgz
```

### 4. Publish

```bash
# Login to npm (first time only)
npm login

# Publish
npm publish --access public
```

### 5. Use Published Package

In your apps:

```bash
npm install @your-org/git-cms
```

## Best Practices

### 1. Version Control

Don't commit:
- `.env.local`
- `node_modules/`
- `.next/`

### 2. Content Storage

Store content in your repo:
```
content/
└── pages/
    ├── home.md
    ├── about.md
    └── contact.md
```

### 3. Environment Variables

Use different values for dev/prod:

```env
# Development (.env.local)
GITHUB_OWNER=your-username
GITHUB_REPO=your-test-repo

# Production (Vercel)
GITHUB_OWNER=your-username
GITHUB_REPO=your-production-repo
```

### 4. TypeScript

Use types from the package:

```typescript
import type { PageContent, Block } from '@git-cms/core'
```

## Next Steps

1. ✅ Set up basic installation
2. ✅ Configure GitHub OAuth
3. ✅ Create content directory
4. ✅ Add content rendering
5. 🎯 Customize block components
6. 🎯 Add custom blocks
7. 🎯 Style CMS admin
8. 🚀 Deploy to production

## Support

- 📖 Full documentation: See README.md
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Ready to deploy?** Your app works like any Next.js app - just push and deploy! 🚀
