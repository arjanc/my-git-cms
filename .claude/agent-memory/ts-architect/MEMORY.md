# Git CMS Starter - Architect Memory

## Key Architecture
- Package: `packages/git-cms/` compiled with `tsc` only (`"jsx": "react"` - needs `import React from 'react'` in all TSX)
- Bundle script: `bash bundle-cms.sh` copies `packages/git-cms/dist` → `example-app/lib/git-cms/`
- After ANY package change: run `bash bundle-cms.sh` from repo root
- Example-app references: `"@git-cms/core": "file:./lib/git-cms"`

## 2-File Wiring in example-app
- `app/admin/[[...cms]]/page.tsx` → imports `AdminPage` from `@git-cms/core/next` (or `/next/page`), passes `blockSchemas`/`pageSchemas`
- `app/admin/api/[[...cms]]/route.ts` → re-exports `GET, POST, DELETE` from `@git-cms/core/next` (or `/next/route`)

## Key Source Files
- `packages/git-cms/src/types/schemas.ts` — `FieldSchema`, `BlockSchema`, `PageSchema`, `BlockInstance`, `PageContent`
- `packages/git-cms/src/lib/markdown.ts` — `parseMarkdown`, `serializeToMarkdown`, `generateBlockId`
- `packages/git-cms/src/components/BlockEditor.tsx` — schema-driven field editor (client component)
- `packages/git-cms/src/components/Editor.tsx` — schema-aware editor; `filePath: string | null`; `handleSave` guards on `!filePath` — create mode needs filename
- `packages/git-cms/src/components/FileList.tsx` — fetches `${apiBasePath}/${contentPath}`; shows empty state
- `packages/git-cms/src/components/CMS.tsx` — owns `currentView`, `selectedFile`, `activeContentPath` state; `handleSelectSchema` sets `activeContentPath` from `schema.contentPath`
- `packages/git-cms/src/components/Dashboard.tsx` — renders pageSchema buttons and a static "Repository Info" card
- `packages/git-cms/src/next/admin-page.tsx` — async Server Component; calls `auth()`; hardcodes `contentPath: 'content/pages'` in CMS props (pre-feature)
- `packages/git-cms/src/next/dispatcher.ts` — unified catch-all: `auth/*` → NextAuth, `cms/*` → Octokit handler

## API Handler Key Behaviours
- `handler.ts` POST: reads `{ path, content, pageContent, message, sha }` from body; `sha` is optional (omit for create)
- `handler.ts` GET 404 on directory → returns `[]` so FileList shows empty state
- `createOrUpdateFileContents` without `sha` → creates new file (GitHub API behaviour)

## Example-App Config
- `example-app/cms.config.ts` — exports `blockSchemas` and `pageSchemas`; pageSchemas have `contentPath: 'content/pages'` and `contentPath: 'content/blog'`
- `example-app/components/blocks/` — React block components: Hero, Banner, USP, Image, Text
- `example-app/app/[[...slug]]/page.tsx` — public page renderer (reads from local filesystem)
- `example-app/content/pages/` and `example-app/content/blog/` — markdown content files

## Common Issues
- Perpetual compiling: Keep `./next/page` and `./next/route` as separate sub-path exports so Turbopack doesn't cross-contaminate module graphs
- `files.map is not a function`: Check `response.ok` before `setFiles`; ensure NextAuth route exists
- `"jsx": "react"` requires explicit `import React from 'react'` in every TSX file in the package
- `serverExternalPackages: ['@octokit/rest', '@octokit/core']` in next.config.ts is required

## Env Vars
- `GIT_CMS_BASE_PATH` — CMS mount point (default `/admin`)
- `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `GITHUB_OWNER`, `GITHUB_REPO`, `NEXTAUTH_URL`

## Confirmed Design Patterns
- `PageSchema.contentPath` is currently a repo-relative path string, no base applied
- `admin-page.tsx` hardcodes `contentPath: 'content/pages'` — ignored once `pageSchemas` is set, because `CMS.tsx` uses `schema.contentPath` via `handleSelectSchema`
- The `contentPath` CMS prop is a legacy default; real path comes from `activeContentPath` set by `handleSelectSchema`
- Dashboard shows all pageSchema types as cards; clicking one calls `onSelectSchema` → sets `activeContentPath`

## Planned Feature Areas (see patterns.md for full plan)
- Feature 1: `contentBase` global prefix + `PageSchema.contentPath` resolution in `admin-page.tsx`
- Feature 2: "Create new" button in `FileList`, create mode in `Editor` with filename input
- Feature 3: Works for all schema entities (already flows through `activeContentPath`)
