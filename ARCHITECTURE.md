# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   CMS App       │      │   GitHub API    │      │   Web App       │
│   (Admin UI)    │─────▶│   (Storage)     │◀─────│   (Public Site) │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                         │                         │
        │                         │                         │
        ▼                         ▼                         ▼
  [Next.js SSR]           [Git Commits]            [Next.js SSG/ISR]
  [NextAuth]              [Markdown Files]         [Static Pages]
  [Visual Editor]         [Version Control]        [Block Rendering]
```

## Core Components

### 1. CMS App (Admin Interface)

**Path**: `packages/cms-app`

**Purpose**: Content authoring and management

**Technology Stack**:
- Next.js (Pages Router + SSR)
- NextAuth.js for GitHub OAuth
- Octokit for GitHub API communication
- shadcn/ui + Tailwind CSS for UI
- TypeScript for type safety

**Key Features**:
- GitHub OAuth authentication
- Repository browser
- Visual block-based page editor
- Real-time markdown generation
- Direct Git commits via API

**Architecture Pattern**: 
- Server-side rendering for security (API keys never exposed)
- Client-side state management for editor
- API routes proxy GitHub API calls

### 2. Shared Library

**Path**: `packages/shared`

**Purpose**: Common code between CMS and Web App

**Contents**:
- Block type definitions (TypeScript interfaces)
- Markdown serialization/deserialization
- Validation utilities
- Default block creators

**Why Shared?**:
- Single source of truth for block schemas
- Consistent behavior across apps
- Easy to publish as NPM package later

### 3. Web App (Public Website)

**Purpose**: Render content for end users

**Technology Stack**:
- Next.js (Pages Router + SSG/ISR)
- gray-matter for frontmatter parsing
- Tailwind CSS for styling
- TypeScript

**Key Features**:
- Static site generation at build time
- Incremental Static Regeneration (ISR)
- Dynamic routing based on markdown files
- Block-based rendering

**Architecture Pattern**:
- Build-time page generation
- File-system based routing
- Zero runtime dependencies on external APIs

## Data Flow

### Content Creation Flow

```
1. User signs in via GitHub OAuth
   └─▶ CMS receives access token

2. User selects repository
   └─▶ CMS lists markdown files via GitHub API

3. User creates/edits page
   └─▶ Block-based editor updates state
   └─▶ Frontend generates markdown with frontmatter

4. User clicks "Save"
   └─▶ CMS sends markdown to GitHub API
   └─▶ GitHub creates commit
   └─▶ File stored in repository

5. GitHub webhook triggers
   └─▶ Vercel receives notification
   └─▶ Web app rebuilds
   └─▶ New page goes live
```

### Content Rendering Flow

```
1. Build time (or ISR revalidation)
   └─▶ Next.js reads all .md files
   └─▶ Generates static paths from slugs

2. For each page:
   └─▶ Parse markdown frontmatter
   └─▶ Extract block data
   └─▶ Generate static HTML

3. User visits page
   └─▶ Serve pre-rendered HTML
   └─▶ Hydrate React components
   └─▶ Render blocks sequentially
```

## Security Architecture

### Authentication

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  GitHub  │────▶│ NextAuth │────▶│   CMS    │
│  OAuth   │     │  Session │     │   App    │
└──────────┘     └──────────┘     └──────────┘
```

**Security Features**:
- OAuth 2.0 flow (industry standard)
- Server-side session management
- No client-side token exposure
- Scoped permissions (repo access only)

### Data Access

**CMS App**:
- User authentication required
- GitHub API calls proxied through API routes
- Access tokens stored server-side only
- CSRF protection via NextAuth

**Web App**:
- Public, no authentication needed
- Read-only access to content
- No API keys required
- Static files only

## Scalability Considerations

### CMS App Scaling

**Bottlenecks**:
- GitHub API rate limits (5000 requests/hour authenticated)
- NextAuth session storage

**Solutions**:
- Implement request caching
- Rate limit client-side requests
- Use GitHub App instead of OAuth for higher limits

### Web App Scaling

**Advantages**:
- Static files = infinite scalability
- CDN-friendly (Vercel Edge Network)
- No database = no bottleneck

**Performance**:
- First load: <1s (static HTML)
- Subsequent loads: <100ms (cached)
- Build time: ~1s per page

## Deployment Architecture

### Development Environment

```
Local Machine
├── packages/
│   ├── cms-app (localhost:3000)
│   └── shared (common logic)
├── web-app (localhost:3001)
└── Content Repo (Git submodule/clone)
```

### Production Environment

```
Vercel Infrastructure
├── CMS App (cms.example.com)
│   ├── Serverless Functions (API routes)
│   ├── Edge Network (Static assets)
│   └── Environment Variables (Secrets)
│
├── Web App (example.com)
│   ├── Edge Network (Static pages)
│   └── ISR Cache (Incremental updates)
│
└── GitHub Repository
    ├── Content files (.md)
    ├── Webhooks (Deploy triggers)
    └── Version history (Git commits)
```

## Block System Architecture

### Block Type System

```typescript
// Type hierarchy
BaseBlock (interface)
├── HeroBlock
├── USPBlock  
├── BannerBlock
├── VideoBlock
├── ImageBlock
└── TextBlock
```

**Design Principles**:
- Each block is self-contained
- Blocks serialize to YAML/JSON
- Blocks are framework-agnostic (just data)
- Renderers are framework-specific (React components)

### Extensibility

**Adding a new block type**:

1. Define TypeScript interface in `packages/shared/block-types.ts`
2. Create editor component in `packages/cms-app/components/blocks/editors/`
3. Create renderer component in `web-app/components/blocks/`
4. Register in factory components
5. Done! No database migrations needed

## Future Architecture Improvements

### Phase 1: Current State ✅
- Basic CMS with GitHub storage
- Block-based editing
- Static site generation

### Phase 2: Enhanced Features 🚧
- [ ] Image upload to GitHub
- [ ] Asset management system
- [ ] Draft/publish workflow
- [ ] Multi-language support

### Phase 3: Advanced Features 🔮
- [ ] Real-time collaboration
- [ ] Custom block builder UI
- [ ] Plugin system
- [ ] AI content suggestions

### Phase 4: Platform 🚀
- [ ] NPM package distribution
- [ ] Multi-tenant support
- [ ] Marketplace for blocks/themes
- [ ] Enterprise features

## Technology Choices Rationale

### Why Next.js?
- Industry standard for React SSR/SSG
- Great developer experience
- Built-in API routes
- Vercel deployment optimization

### Why GitHub for storage?
- Version control built-in
- No database to manage
- Familiar to developers
- Free for public repos
- Great API

### Why Markdown + Frontmatter?
- Human-readable
- Git-friendly (diffable)
- Standard format
- Easy to migrate
- IDE support

### Why shadcn/ui?
- No npm package bloat (copy/paste)
- Full customization
- Accessible by default
- Beautiful components
- Tailwind native

## Performance Metrics

### CMS App
- **Time to Interactive**: <2s
- **Bundle Size**: ~150KB (gzipped)
- **API Response**: <500ms (GitHub API dependent)

### Web App
- **Lighthouse Score**: 95+ (all metrics)
- **First Contentful Paint**: <1s
- **Time to Interactive**: <1.5s
- **SEO**: 100 (static HTML)

## Monitoring & Observability

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics
- **Logs**: Vercel Logs
- **Uptime**: Vercel Status

### Key Metrics to Track
- GitHub API rate limit usage
- CMS editor load time
- Web app build duration
- Failed deployments
- Authentication errors
