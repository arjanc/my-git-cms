# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Git-based CMS package (`@git-cms/core`) for Next.js apps — like Outstatic or DecapCMS. GitHub serves as the data store; content is stored as markdown files with YAML frontmatter in the consuming app's repository.

## Repository Structure

```
git-cms-starter/
├── packages/git-cms/     # The npm-publishable TypeScript package
│   ├── src/              # Source files — edit these
│   └── dist/             # Compiled output — do not edit
├── example-app/          # Example Next.js app consuming the package
│   ├── app/admin/        # CMS admin UI page
│   ├── app/api/cms/      # Dynamic API route for CMS operations
│   └── lib/git-cms/      # Bundled copy of the package (for Vercel)
└── bundle-cms.sh         # Script to sync built package into example-app/
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

## Commands

### Package development (`packages/git-cms/`)
```bash
npm run build   # Compile TypeScript to dist/
npm run dev     # Watch mode (tsc --watch)
```

### Example app (`example-app/`)
```bash
npm run dev     # Start Next.js dev server
npm run build   # Production build
npm run lint    # ESLint
```

### Bundling changes into the example app
After modifying `packages/git-cms/src/`, run:
```bash
./bundle-cms.sh
```
This builds the package and copies `dist/` + `package.json` into `example-app/lib/git-cms/`.

## Architecture

### Package exports (`packages/git-cms/src/`)

| Export path | Entry | Contents |
|---|---|---|
| `@git-cms/core` | `index.ts` | `CMS` component, block types, markdown utilities |
| `@git-cms/core/api` | `api/index.ts` | `createGitCMSHandler` factory |
| `@git-cms/core/components` | components re-export | React components |
| `@git-cms/core/auth` | `auth.ts` | NextAuth GitHub config |

### Key source files

- **`src/api/handler.ts`** — `createGitCMSHandler()` factory; all GitHub API (Octokit) CRUD lives here. GET lists/reads files, POST creates/updates, DELETE removes.
- **`src/auth.ts`** — NextAuth v5 GitHub OAuth config; injects `accessToken` into the JWT/session for Octokit calls.
- **`src/types/blocks.ts`** — Discriminated union `Block` type covering `hero | banner | usp | video | image | text`. `PageContent` is the top-level content model. `createDefaultBlock()` is the factory.
- **`src/lib/markdown.ts`** — `serializeToMarkdown` / `parseMarkdown` using `gray-matter` for YAML frontmatter round-trips.
- **`src/components/CMS.tsx`** — Client component; owns view state (dashboard / file list / editor). Coordinates `Dashboard`, `FileList`, `Editor` sub-components.
- **`src/components/Editor.tsx`** — Loads content via `GET /api/cms/{path}`, saves via `POST /api/cms/{path}`.

### How the example app wires it up

- **`example-app/app/admin/page.tsx`** — Renders `<CMS>` with props (basePath, contentPath, githubOwner, githubRepo).
- **`example-app/app/api/cms/[...path]/route.ts`** — Calls `createGitCMSHandler`, passing `getAccessToken` (reads from NextAuth session) and GitHub owner/repo from env vars.

### Why `lib/git-cms/` exists

The `file:` protocol in `package.json` doesn't resolve correctly on Vercel. `bundle-cms.sh` copies the built package into `example-app/lib/git-cms/` so it deploys as a self-contained directory dependency. When developing locally, either approach works; for Vercel, always bundle first.

## Environment Variables

Needed in `example-app/.env`:
```
AUTH_GITHUB_ID=       # GitHub OAuth app client ID
AUTH_GITHUB_SECRET=   # GitHub OAuth app client secret
AUTH_SECRET=          # Random string for NextAuth
GITHUB_OWNER=         # GitHub username/org owning the content repo
GITHUB_REPO=          # Repo name where content .md files live
```

## Content Format

Markdown files stored in `content/pages/*.md` use YAML frontmatter for page metadata and a `blocks` array; body text is ignored by the current parser. `serializeToMarkdown` / `parseMarkdown` handle the round-trip.
