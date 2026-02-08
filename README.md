# Git CMS Monorepo + Git‑Based CMS Starter

A **Git-powered CMS monorepo** that combines a **public website** and a **Git‑based CMS admin** in a **single Vercel deployment**, built with **Next.js 15, App Router, React 19, NextAuth v5, and Tailwind CSS**.

This README merges:
- **Monorepo & deployment setup** (root workspace, Vercel routing, shared packages)
- **CMS App & Web App project details** (features, stack, usage, blocks, auth, performance)

---

## ✨ Overview

**One repo. One domain. Two apps. No backend.**

| Path | App | Purpose |
|------|-----|--------|
| `/` | Web App | Public website (SSG / ISR) |
| `/admin` | CMS App | Git‑based CMS admin |

All content is stored as **Markdown in GitHub**, edited visually via the CMS, and rendered statically on the website.

---

## 🆕 What’s New (v2.0)

- ✅ Next.js 15 (App Router + RSC)
- ✅ React 19
- ✅ NextAuth v5 (Server Actions)
- ✅ Tailwind CSS 3.4
- ✅ TypeScript 5.7
- ✅ shadcn/ui + Radix UI
- ✅ GitHub API (Octokit v21)
- ✅ Server Actions & Server Components
- ✅ Single‑domain monorepo deployment

---

## 🚀 Key Features

### CMS Features
- 🔐 GitHub OAuth Authentication
- 📝 Visual block‑based editor
- 🎨 Hero, Banner, USP, Video, Image, Text blocks
- 📦 Git‑powered content storage
- ⚡ Serverless (no backend)
- 🔄 Server Actions (type‑safe)

### Monorepo & Deployment
- ✅ Single Vercel project
- ✅ `/admin` routed to CMS
- ✅ Shared types via `@git-cms/shared`
- ✅ One domain, shared env variables
- ✅ Unified analytics & hosting

### Web App
- ⚡ Static generation (SSG)
- 🔁 ISR (Incremental Static Regeneration)
- 🧾 Markdown + frontmatter parsing
- 🏎️ Excellent Lighthouse scores

---

## 🏗️ Architecture

```
your-domain.com/           → Web App (public)
your-domain.com/admin      → CMS App (admin)
```

Both apps are deployed under **one Vercel project**.

---

## 📁 Project Structure (Monorepo)

```
git-cms-monorepo/
├── packages/
│   ├── cms-app/          # CMS Admin (Next.js App Router)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── auth.ts
│   │   ├── middleware.ts
│   │   └── package.json
│   └── shared/           # Shared types & utilities
│       ├── block-types.ts
│       ├── markdown-utils.ts
│       └── package.json
│
├── web-app/              # Public Website (SSG / ISR)
│   ├── pages/
│   ├── components/
│   ├── content/          # Markdown content
│   └── package.json
│
├── package.json          # Root workspace config
└── vercel.json           # Deployment routing
```

---

## 🧱 Tech Stack

### CMS App (`packages/cms-app`)
- Next.js 15 (App Router + RSC)
- NextAuth v5
- React 19
- Octokit v21
- Tailwind CSS 3.4
- shadcn/ui + Radix UI
- TypeScript 5.7

### Web App (`web-app`)
- Next.js 15 (SSG / ISR)
- gray‑matter (Markdown frontmatter)
- Tailwind CSS 3.4
- TypeScript 5.7
- React 19

### Shared (`packages/shared`)
- Shared block types
- Markdown utilities
- Cross‑app type safety

---

## 🚀 Quick Start

### 1️⃣ Install Dependencies

```bash
npm install
```

Installs dependencies for **all workspaces**.

---

### 2️⃣ GitHub OAuth Setup

Create a GitHub OAuth App:

- Homepage URL: `http://localhost:3000`
- Callback URL (local):

```
http://localhost:3000/admin/api/auth/callback/github
```

Production:

```
https://your-domain.com/admin/api/auth/callback/github
```

---

### 3️⃣ Configure Environment

Create `.env.local` in:

```
packages/cms-app/
```

```env
AUTH_GITHUB_ID=your_client_id
AUTH_GITHUB_SECRET=your_client_secret
AUTH_SECRET=run_openssl_rand_base64_32
```

Generate secret:

```bash
openssl rand -base64 32
```

---

### 4️⃣ Run Development

```bash
npm run dev           # Run both apps
npm run dev:web       # Web only (:3000)
npm run dev:admin     # CMS only (:3001)
```

Access:

- Web: http://localhost:3000
- CMS: http://localhost:3000/admin

---

## 🔧 Scripts

```bash
npm run dev
npm run dev:web
npm run dev:admin

npm run build
npm run build:web
npm run build:admin

npm run clean
```

---

## 🔄 Routing & Rewrites

### Development Rewrite (`web-app/next.config.js`)

```js
async rewrites() {
  return [
    {
      source: '/admin/:path*',
      destination: 'http://localhost:3001/admin/:path*'
    }
  ]
}
```

### Production (`vercel.json`)

```json
{
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "/packages/cms-app/:path*"
    }
  ]
}
```

---

## 🔐 Authentication

- NextAuth v5
- GitHub OAuth
- Base path: `/admin/api/auth`
- Middleware protects `/admin/*`

```ts
export const config = {
  matcher: ['/admin/:path*']
}
```

---

## 📝 Creating Content

1. Visit `/admin`
2. Sign in with GitHub
3. Select repository
4. Create new page
5. Add blocks
6. Save → commits Markdown to GitHub

---

## 🧩 Available Block Types

- Hero
- USP Grid
- Banner
- Video
- Image
- Text

---

## ➕ Add a New Block

1. Define type in `shared/block-types.ts`
2. Create CMS editor UI
3. Create Web App renderer
4. Register block in factory

---

## ⚡ Performance

### CMS (App Router)
- React Server Components
- Streaming + Suspense
- Smaller client bundles

### Web App (SSG)
- Static builds
- ISR
- Edge‑ready
- Lighthouse 95+ scores

---

## 🌐 Deployment (Vercel)

```bash
vercel
```

Set environment variables in Vercel:

```
AUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
```

---

## 🔄 Migration (v1 → v2)

- Pages Router → App Router
- NextAuth v4 → v5
- `NEXTAUTH_*` → `AUTH_*`
- Convert API routes → Server Actions

Migration guide: `MIGRATION.md`

---

## 📦 Publishing CMS as NPM Package

```bash
cd packages/cms-app
npm publish --access public
```

Use in any Next.js app:

```tsx
import { GitCMS } from '@your-org/git-cms'

export default function AdminPage() {
  return <GitCMS />
}
```

---

## 🛠️ Troubleshooting

**OAuth callback invalid?**
- Ensure `/admin/api/auth/callback/github` matches exactly

**Import errors?**
```bash
npm run clean
npm install
```

**CMS not loading?**
- Check rewrites
- Ensure both apps run

---

## 📚 Documentation

- SETUP_GUIDE.md
- ARCHITECTURE.md
- MIGRATION.md
- MONOREPO_DEPLOYMENT.md

---

## 🤝 Contributing

PRs welcome. Test both apps before submitting.

---

## 📜 License

MIT

---

Built with ❤️ using **Next.js 15, React 19, Tailwind CSS, and GitHub‑powered content**

