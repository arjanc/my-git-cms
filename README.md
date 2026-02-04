# Git-Based CMS Starter

A modern, serverless CMS built with Next.js that stores content as Markdown files in a GitHub repository. No backend required!

## Features

- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub
- 📝 **Visual Block Editor** - Drag-and-drop content blocks
- 🎨 **Customizable Blocks** - Hero, Banner, USP, Video, Image, and Text blocks
- 📦 **Git-Powered Storage** - All content stored in your GitHub repo
- ⚡ **Serverless Architecture** - No backend to manage
- 🚀 **Vercel-Ready** - Deploy in minutes
- 🎯 **TypeScript** - Fully typed for better DX
- 💅 **Tailwind CSS + shadcn/ui** - Beautiful, accessible components

## Project Structure

```
git-cms-starter/
├── cms-app/              # CMS Admin Interface
│   ├── components/       # React components
│   │   ├── blocks/      # Block editor components
│   │   └── PageEditor.tsx
│   ├── pages/           # Next.js pages
│   │   ├── api/         # API routes
│   │   ├── editor/      # Editor pages
│   │   └── index.tsx    # Main dashboard
│   └── lib/             # Utilities
│       └── github-api.ts
│
├── web-app/             # Public-Facing Website
│   ├── components/      # React components
│   │   └── blocks/     # Block renderer components
│   ├── pages/          # Next.js pages
│   │   └── [...slug].tsx # Dynamic page routing
│   └── content/        # Markdown content
│       └── pages/      # Page files
│
└── shared/             # Shared code between apps
    ├── block-types.ts  # Block type definitions
    └── markdown-utils.ts
```

## Setup Instructions

### 1. GitHub OAuth App

Create a GitHub OAuth App:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `My Git CMS`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret

### 2. CMS App Setup

```bash
cd cms-app
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
# GITHUB_CLIENT_ID=your_client_id
# GITHUB_CLIENT_SECRET=your_client_secret
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=run_this_command: openssl rand -base64 32

# Start development server
npm run dev
```

The CMS will be available at http://localhost:3000

### 3. Web App Setup

```bash
cd web-app
npm install

# Start development server
npm run dev
```

The website will be available at http://localhost:3001

## Usage

### Creating Content

1. **Sign In**: Open http://localhost:3000 and sign in with GitHub
2. **Select Repository**: Choose a repository to store your content
3. **Create Page**: Click "New Page" to create a new page
4. **Add Blocks**: Use the block palette to add content blocks
5. **Configure Blocks**: Fill in the block content using the form fields
6. **Save**: Click "Save Page" to commit to GitHub

### Available Block Types

#### Hero Block
Large header section with heading, subheading, CTA button, and background image.

```typescript
{
  type: 'hero',
  heading: 'Welcome',
  subheading: 'Build amazing things',
  ctaText: 'Get Started',
  ctaUrl: '/signup',
  backgroundImage: 'https://...'
}
```

#### USP Block
Feature list showcasing unique selling points.

```typescript
{
  type: 'usp',
  title: 'Why Choose Us',
  items: [
    { title: 'Fast', description: '...', icon: '⚡' }
  ]
}
```

#### Other Blocks
- **Banner**: Information banners
- **Video**: Embedded videos
- **Image**: Images with captions
- **Text**: Rich text content

### Markdown File Structure

Pages are stored as markdown files with YAML frontmatter:

```markdown
---
title: Home
slug: /
description: Page description
blocks:
  - id: block_123
    type: hero
    heading: Welcome
metadata:
  createdAt: '2024-01-15T10:00:00Z'
---
```

## Deployment

### Deploying CMS App to Vercel

```bash
cd cms-app
vercel

# Set environment variables in Vercel dashboard:
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - NEXTAUTH_URL (your production URL)
# - NEXTAUTH_SECRET
```

Update your GitHub OAuth App callback URL to your Vercel domain.

### Deploying Web App to Vercel

```bash
cd web-app
vercel
```

The web app will automatically rebuild when you push changes to your content repository.

## Extending the CMS

### Adding New Block Types

1. **Define the type** in `shared/block-types.ts`:
```typescript
export interface CustomBlock extends BaseBlock {
  type: 'custom';
  customField: string;
}
```

2. **Create editor component** in `cms-app/components/blocks/editors/CustomBlockEditor.tsx`

3. **Create renderer component** in `web-app/components/blocks/Custom.tsx`

4. **Register in factories**:
   - Add to `BlockEditor.tsx` switch statement
   - Add to `BlockRenderer.tsx` switch statement

### Customizing Styles

The project uses Tailwind CSS with shadcn/ui components. Customize:
- `tailwind.config.js` for theme colors
- Individual component files for specific styling
- `globals.css` for CSS variables

## How It Works

1. **Authentication**: Users sign in with GitHub OAuth
2. **Repository Access**: CMS requests read/write access to repositories
3. **Content Editing**: Visual editor creates/updates markdown files
4. **GitHub API**: Changes are committed directly to GitHub
5. **Webhook**: GitHub notifies Vercel of changes
6. **Rebuild**: Vercel rebuilds the web app with new content
7. **Static Generation**: Pages are generated at build time (ISR)

## Tech Stack

### CMS App
- Next.js 14 (Pages Router)
- NextAuth.js (GitHub OAuth)
- Octokit (GitHub API)
- shadcn/ui + Radix UI
- Tailwind CSS
- TypeScript

### Web App
- Next.js 14 (SSG/ISR)
- gray-matter (Frontmatter parsing)
- Tailwind CSS
- TypeScript

## Roadmap

- [ ] Image upload to GitHub
- [ ] Drag-and-drop block reordering
- [ ] Block preview mode
- [ ] Multiple language support
- [ ] Asset management
- [ ] Collaborative editing
- [ ] Custom block templates
- [ ] NPM package for easier installation

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.
