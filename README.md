# Git-Based CMS Starter (Next.js 15 + App Router)

A modern, serverless CMS built with the latest Next.js 15 App Router that stores content as Markdown files in a GitHub repository. No backend required!

## 🆕 What's New (v2.0)

- ✅ **Next.js 15** - Latest version with App Router
- ✅ **NextAuth v5** - Modern authentication with Server Actions
- ✅ **React 19** - Latest React with Server Components
- ✅ **Tailwind CSS 3.4** - Latest utility-first CSS framework
- ✅ **TypeScript 5.7** - Latest TypeScript with improved types
- ✅ **shadcn/ui** - Latest components with Radix UI primitives

## Features

- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub
- 📝 **Visual Block Editor** - Drag-and-drop content blocks
- 🎨 **Customizable Blocks** - Hero, Banner, USP, Video, Image, and Text blocks
- 📦 **Git-Powered Storage** - All content stored in your GitHub repo
- ⚡ **Serverless Architecture** - No backend to manage
- 🚀 **Vercel-Ready** - Deploy in minutes
- 🎯 **TypeScript** - Fully typed for better DX
- 💅 **Tailwind CSS + shadcn/ui** - Beautiful, accessible components
- 🔄 **Server Actions** - Type-safe server mutations
- ⚛️ **React Server Components** - Better performance and SEO

## Tech Stack

### CMS App
- **Next.js 15** (App Router + RSC)
- **NextAuth.js v5** (GitHub OAuth with Server Actions)
- **Octokit v21** (GitHub API)
- **shadcn/ui** (Latest components)
- **Radix UI** (Primitives)
- **Tailwind CSS 3.4**
- **TypeScript 5.7**
- **React 19**

### Web App
- **Next.js 15** (SSG/ISR)
- **gray-matter** (Frontmatter parsing)
- **Tailwind CSS 3.4**
- **TypeScript 5.7**
- **React 19**

## Project Structure

```
git-cms-starter/
├── cms-app/              # CMS Admin Interface (App Router)
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API Routes
│   │   ├── auth/        # Auth pages
│   │   ├── editor/      # Editor pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home (dashboard)
│   │   └── globals.css  # Global styles
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── blocks/     # Block editors
│   │   ├── page-editor.tsx
│   │   ├── dashboard-client.tsx
│   │   └── editor-client.tsx
│   ├── lib/            # Utilities
│   │   ├── github-api.ts
│   │   └── utils.ts
│   ├── types/          # TypeScript types
│   ├── auth.ts         # NextAuth config
│   ├── middleware.ts   # Auth middleware
│   └── package.json
│
├── web-app/            # Public Website
│   ├── pages/         # Pages Router (for SSG)
│   ├── components/    # React components
│   └── content/       # Markdown content
│
└── shared/            # Shared code
    ├── block-types.ts
    └── markdown-utils.ts
```

## Quick Start

### 1. Prerequisites

- Node.js 18+ or 20+
- GitHub account
- Git installed

### 2. GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `My Git CMS`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate and copy the **Client Secret**

### 3. CMS Installation

```bash
cd cms-app
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# AUTH_GITHUB_ID=your_client_id
# AUTH_GITHUB_SECRET=your_client_secret
# AUTH_SECRET=run_this_command_below

# Generate AUTH_SECRET
openssl rand -base64 32

# Start development server
npm run dev
```

The CMS will be available at http://localhost:3000

### 4. Web App Installation

```bash
cd web-app
npm install
npm run dev
```

The website will be available at http://localhost:3001

## Key Differences from v1 (Pages Router)

### App Router Benefits

1. **Server Components by Default** - Better performance, smaller bundles
2. **Built-in Loading/Error States** - Better UX with loading.tsx and error.tsx
3. **Layouts** - Shared UI across routes without re-rendering
4. **Server Actions** - Type-safe server mutations without API routes
5. **Streaming** - Progressive rendering with Suspense

### NextAuth v5 Changes

```typescript
// Old (v4 - Pages Router)
import { useSession, signIn, signOut } from 'next-auth/react'

// New (v5 - App Router)
import { auth, signIn, signOut } from '@/auth'

// Server Components can use auth() directly
const session = await auth()

// Client Components use Server Actions
<form action={async () => {
  "use server"
  await signIn("github")
}}>
```

### File Structure Changes

| v1 (Pages Router) | v2 (App Router) |
|-------------------|-----------------|
| `pages/` | `app/` |
| `pages/api/` | `app/api/` |
| `pages/_app.tsx` | `app/layout.tsx` |
| `pages/index.tsx` | `app/page.tsx` |
| `styles/globals.css` | `app/globals.css` |

## Environment Variables

**Previous (NextAuth v4):**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**Current (NextAuth v5):**
```env
AUTH_SECRET=secret
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

## Usage

### Creating Content

1. Sign in at http://localhost:3000
2. Select a repository
3. Click "New Page"
4. Add blocks using the editor
5. Configure each block
6. Click "Save" to commit to GitHub

### Available Block Types

- **Hero**: Large header with CTA
- **USP**: Feature showcase grid
- **Banner**: Announcement banners
- **Video**: Embedded videos
- **Image**: Images with captions
- **Text**: Rich text content

## Deployment

### Vercel (Recommended)

```bash
# Deploy CMS
cd cms-app
vercel

# Set environment variables in Vercel dashboard:
# - AUTH_SECRET
# - AUTH_GITHUB_ID
# - AUTH_GITHUB_SECRET
```

Update GitHub OAuth callback URL to your Vercel domain.

### Deploy Web App

```bash
cd web-app
vercel
```

## Migration from v1 to v2

If you have an existing v1 installation:

1. **Update dependencies** - All packages are newer versions
2. **Move files** - Migrate from `pages/` to `app/` structure
3. **Update auth** - Switch from NextAuth v4 to v5
4. **Update env vars** - Rename `NEXTAUTH_*` to `AUTH_*`
5. **Server Components** - Convert Client Components where appropriate
6. **Server Actions** - Replace some API routes with Server Actions

See migration guide: [MIGRATION.md](./MIGRATION.md)

## Extending the CMS

### Add New Block Type

1. Define interface in `shared/block-types.ts`
2. Create editor in `cms-app/components/blocks/editors/`
3. Create renderer in `web-app/components/blocks/`
4. Register in factory components

### Customize Styles

- Edit `tailwind.config.ts` for theme
- Modify `app/globals.css` for CSS variables
- Update component files for specific styling

## Performance Optimizations

### CMS App (App Router)

- ✅ React Server Components reduce client bundle
- ✅ Automatic code splitting
- ✅ Streaming with Suspense
- ✅ Server Actions eliminate API route overhead

### Web App (SSG)

- ✅ Static generation at build time
- ✅ ISR for incremental updates
- ✅ Edge-ready deployment
- ✅ Perfect Lighthouse scores (95+)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Troubleshooting

### "Invalid OAuth callback URL"

Make sure your GitHub OAuth app callback URL matches exactly:
- Development: `http://localhost:3000/api/auth/callback/github`
- Production: `https://your-domain.com/api/auth/callback/github`

### "Module not found" errors

```bash
# Clear Next.js cache
rm -rf .next
npm install
npm run dev
```

### Environment variables not working

- Variables must be in `.env.local` (not `.env`)
- Restart dev server after changing env vars
- In production, set in Vercel dashboard

## Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [MIGRATION.md](./MIGRATION.md) - Migration from v1 to v2

## Changelog

### v2.0.0 (2024)
- Upgraded to Next.js 15 with App Router
- Upgraded to NextAuth v5
- Upgraded to React 19
- Upgraded to Tailwind CSS 3.4
- Upgraded to TypeScript 5.7
- Added Server Components
- Added Server Actions
- Improved performance
- Better type safety

### v1.0.0 (2024)
- Initial release with Pages Router
- NextAuth v4
- React 18
- Tailwind CSS 3.3

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas

---

Built with ❤️ using Next.js 15, React 19, and Tailwind CSS 3.4
