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
│   ├── app/admin/        # All admin routes (thin re-exports only)
│   └── lib/git-cms/      # Bundled copy of the package (for Vercel)
└── bundle-cms.sh         # Script to sync built package into example-app/
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
```

### Bundling changes into the example app
After modifying `packages/git-cms/src/`, always run:
```bash
./bundle-cms.sh
```
This builds the package and copies `dist/` + `package.json` into `example-app/lib/git-cms/`. The example app reads from `lib/git-cms/`, not from `packages/git-cms/` directly.

## Architecture

### Package exports (`packages/git-cms/src/`)

| Export path | Entry | Contents |
|---|---|---|
| `@git-cms/core` | `index.ts` | `CMS` component, block types, markdown utilities |
| `@git-cms/core/api` | `api/index.ts` | `createGitCMSHandler` factory |
| `@git-cms/core/components` | `components/index.ts` | All React components |
| `@git-cms/core/auth` | `auth.ts` | NextAuth v5 GitHub OAuth config |
| `@git-cms/core/next` | `next/index.ts` | Pre-wired pages and route handlers (primary integration point) |

### Key source files

- **`src/auth.ts`** — NextAuth v5 config. `basePath` is set to `/admin/api/auth`; sign-in page is `/admin/auth/signin`. Injects GitHub `accessToken` into the JWT/session.
- **`src/api/handler.ts`** — `createGitCMSHandler()` factory. All GitHub API (Octokit) CRUD lives here. GET lists/reads files, POST creates/updates, DELETE removes.
- **`src/next/admin-api-route.ts`** — Pre-wired `GET`, `POST`, `DELETE` handlers. Reads `GITHUB_OWNER`/`GITHUB_REPO` from env and calls `auth()` per-request for the access token.
- **`src/next/auth-route.ts`** — Re-exports `handlers` (GET, POST) from NextAuth for mounting at `/admin/api/auth/[...nextauth]`.
- **`src/next/admin-page.tsx`** — Async Server Component. Calls `auth()` server-side; redirects to NextAuth built-in sign-in if no session. Reads `GIT_CMS_BASE_PATH` env var to configure all sub-paths.
- **`src/next/dispatcher.ts`** — Unified `GET/POST/DELETE` route handler. Routes `auth/*` to NextAuth handlers and `cms/*` to the Octokit CMS handler by inspecting the first URL segment.
- **`src/components/CMS.tsx`** — `'use client'` component; owns view state (dashboard / file list / editor). Accepts `apiBasePath` and threads it to `FileList` and `Editor`.
- **`src/components/FileList.tsx`** — Fetches from `${apiBasePath}/${contentPath}`. Handles 401/error responses with a user-friendly message.
- **`src/components/Editor.tsx`** — Fetches/saves via `${apiBasePath}/${filePath}`.

### How the example app wires it up

The example app has exactly **2 files** — both are single-line re-exports:

| File | Re-exports |
|---|---|
| `app/admin/[[...cms]]/page.tsx` | `AdminPage` from `@git-cms/core/next` |
| `app/admin/api/[[...cms]]/route.ts` | `GET, POST, DELETE` from `@git-cms/core/next` |

`AdminPage` is an async Server Component that calls `auth()` on the server. If there is no session it redirects to `${GIT_CMS_BASE_PATH}/api/auth/signin` — NextAuth's built-in sign-in page served directly from the API route. No separate sign-in page file is needed.

The unified dispatcher (`src/next/dispatcher.ts`) inspects the first URL segment after `/api/` to route internally:
- `auth/*` → NextAuth handlers (OAuth callbacks, session, CSRF)
- `cms/*` → GitHub file operations via Octokit

### Why `lib/git-cms/` exists

The `file:` protocol in `package.json` doesn't resolve correctly on Vercel. `bundle-cms.sh` copies the built package into `example-app/lib/git-cms/` so it deploys as a self-contained directory dependency. Always run `bundle-cms.sh` after modifying the package source.

### tsconfig notes

The package uses `"jsx": "react"` (classic transform). All new `.tsx` files in the package **must** include `import React from 'react'` — the new JSX transform is not active.

## Environment Variables

Needed in `example-app/.env`:
```
AUTH_GITHUB_ID=        # GitHub OAuth app client ID
AUTH_GITHUB_SECRET=    # GitHub OAuth app client secret
AUTH_SECRET=           # Random string for NextAuth
GITHUB_OWNER=          # GitHub username/org owning the content repo
GITHUB_REPO=           # Repo name where content .md files live
GIT_CMS_BASE_PATH=     # Route where the CMS is mounted, e.g. /admin (default: /admin)
```

## GitHub OAuth App Setup

The OAuth callback URL is derived from `GIT_CMS_BASE_PATH`:
```
https://yourdomain.com/${GIT_CMS_BASE_PATH}/api/auth/callback/github
```
For local dev with the default `/admin` path: `http://localhost:3000/admin/api/auth/callback/github`

## Content Format

Markdown files stored in `content/pages/*.md` use YAML frontmatter for page metadata and a `blocks` array; body text is ignored by the current parser. `serializeToMarkdown` / `parseMarkdown` handle the round-trip.
