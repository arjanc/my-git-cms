# Git CMS - Next.js Package

A Git-based CMS package for Next.js apps - like Outstatic or DecapCMS.

## Overview

This is a **single package** that you install in your Next.js app. No separate deployments, no complex monorepo setup. Just add it to your app and deploy to Vercel normally.

## How It Works (Like Outstatic)

```
your-nextjs-app/
├── app/
│   ├── admin/
│   │   └── page.tsx          # <CMS /> component
│   └── api/
│       └── cms/
│           └── [...path]/
│               └── route.ts   # API handlers
├── content/
│   └── pages/
│       └── *.md               # Your content
└── package.json
```

## Installation

### 1. Install the Package

**For local development (before publishing to npm):**

```json
{
  "dependencies": {
    "@git-cms/core": "file:../path/to/packages/git-cms"
  }
}
```

**After publishing to npm:**

```bash
npm install @git-cms/core
```

### 2. Add CMS Page

Create `app/admin/page.tsx`:

```typescript
import { CMS } from '@git-cms/core'

export default function AdminPage() {
  return (
    <CMS
      basePath="/admin"
      contentPath="content/pages"
      githubOwner="your-username"
      githubRepo="your-repo"
    />
  )
}
```

### 3. Add API Routes

Create `app/api/cms/[...path]/route.ts`:

```typescript
import { createGitCMSHandler } from '@git-cms/core/api'
import { auth } from '@/auth'

export const { GET, POST, DELETE } = createGitCMSHandler({
  getAccessToken: async () => {
    const session = await auth()
    return session?.accessToken || null
  },
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
})
```

### 4. Configure NextAuth

Set up NextAuth for GitHub authentication (see example-app).

### 5. Deploy!

```bash
vercel
```

That's it! Standard Vercel deployment - no special configuration needed.

## Development Workflow

### Local Package Development

1. **Build the package:**
   ```bash
   cd packages/git-cms
   npm run build
   # or for watch mode:
   npm run dev
   ```

2. **Use in your app:**
   ```bash
   cd example-app
   npm install
   npm run dev
   ```

The `file:` protocol in package.json links to your local package.

### When Ready to Publish

```bash
cd packages/git-cms
npm version 1.0.0
npm publish
```

Then update apps to use:

```json
{
  "dependencies": {
    "@git-cms/core": "^1.0.0"
  }
}
```

## Vercel Deployment

### Why This Works

✅ **Single Next.js App** - Your app, not a monorepo  
✅ **Standard Build** - No custom configuration  
✅ **One Deployment** - Just `vercel`  
✅ **Works Like Any Package** - Like `next-auth`, `prisma`, etc.  

### Deployment Steps

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set Environment Variables:**
   ```
   AUTH_GITHUB_ID=...
   AUTH_GITHUB_SECRET=...
   AUTH_SECRET=...
   GITHUB_OWNER=your-username
   GITHUB_REPO=your-repo
   ```
4. **Deploy** - Vercel handles everything!

## Package Structure

```
packages/git-cms/
├── src/
│   ├── components/        # React components
│   │   ├── CMS.tsx       # Main CMS component
│   │   ├── Dashboard.tsx
│   │   ├── Editor.tsx
│   │   └── FileList.tsx
│   ├── api/              # API handlers
│   │   ├── handler.ts    # Route handler factory
│   │   └── index.ts
│   ├── lib/              # Utilities
│   │   └── markdown.ts
│   ├── types/            # TypeScript types
│   │   └── blocks.ts
│   └── index.ts          # Main exports
├── dist/                 # Compiled output
├── package.json
└── tsconfig.json
```

## Exports

### Components

```typescript
import { CMS } from '@git-cms/core'
import type { CMSProps } from '@git-cms/core'
```

### API

```typescript
import { createGitCMSHandler } from '@git-cms/core/api'
import type { GitCMSConfig } from '@git-cms/core/api'
```

### Types

```typescript
import type {
  Block,
  PageContent,
  HeroBlock,
  USPBlock,
  // ... more types
} from '@git-cms/core'
```

### Utilities

```typescript
import {
  serializeToMarkdown,
  parseMarkdown,
  generateBlockId,
  createDefaultBlock,
} from '@git-cms/core'
```

## Comparison: Monorepo vs Package

### ❌ Monorepo Approach (Previous)

```
git-cms-monorepo/
├── packages/
│   └── cms-app/          # Separate Next.js app
└── web-app/              # Your app
└── vercel.json           # Complex routing config
```

**Problems:**
- Complex Vercel configuration
- Multiple build outputs
- Routing complexity
- Hard to deploy

### ✅ Package Approach (Current)

```
your-app/
├── app/
│   └── admin/
│       └── page.tsx      # Just import CMS
└── node_modules/
    └── @git-cms/core/    # Regular npm package
```

**Benefits:**
- Simple Next.js app
- Standard Vercel deployment
- Works like any package
- Easy to use

## Usage Examples

### Basic Setup

```typescript
// app/admin/page.tsx
import { CMS } from '@git-cms/core'

export default function AdminPage() {
  return <CMS />
}
```

### With Custom Config

```typescript
import { CMS } from '@git-cms/core'

export default function AdminPage() {
  return (
    <CMS
      basePath="/admin"
      contentPath="content/pages"
      githubOwner={process.env.GITHUB_OWNER}
      githubRepo={process.env.GITHUB_REPO}
    />
  )
}
```

### Using Types

```typescript
import type { PageContent, Block } from '@git-cms/core'

function MyComponent() {
  const page: PageContent = {
    title: 'My Page',
    slug: '/my-page',
    blocks: [],
  }
  // ...
}
```

### Using Utilities

```typescript
import { parseMarkdown, serializeToMarkdown } from '@git-cms/core'

const content = parseMarkdown(markdownString)
const markdown = serializeToMarkdown(content)
```

## Environment Variables

```env
# NextAuth (for GitHub OAuth)
AUTH_GITHUB_ID=your_client_id
AUTH_GITHUB_SECRET=your_secret
AUTH_SECRET=random_string

# GitHub Repository
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
```

## Features

- ✅ **Git-based storage** - All content in your repo
- ✅ **Block-based editor** - Visual content editing
- ✅ **TypeScript** - Full type safety
- ✅ **Zero config** - Works out of the box
- ✅ **Vercel-ready** - Deploy like any Next.js app
- ✅ **Local development** - Use `file:` protocol
- ✅ **Publishable** - Push to npm when ready

## Roadmap

- [ ] Full block editor UI (currently basic)
- [ ] Image upload to GitHub
- [ ] Draft/publish workflow
- [ ] Multi-language support
- [ ] Custom block types
- [ ] Publish to npm

## Contributing

1. Clone the repo
2. Make changes in `packages/git-cms`
3. Test in `example-app`
4. Submit PR

## License

MIT

---

**This is the right approach for Vercel!** 🎉

No monorepo complexity, just a regular Next.js app with a package.
