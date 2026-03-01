# Navigation Redesign - Architecture Decision Record

## Decision: Hybrid Option D + Option A

Chosen approach: nav.json becomes a **slug-order-only** file (Option D), with
page-level `navTitle`, `navOrder`, `navParent`, and `navEnabled` fields (Option A)
for parent-child wiring. nav.json holds only the ordering skeleton; pages hold all
content and hierarchy metadata.

## Key facts about existing wiring

- `lib/nav.ts` exports: `parseNav`, `getNav`
- `package.json` `./nav` sub-path export points to `dist/lib/nav.js`
- `index.ts` exports: `NavItem`, `NavData`, `NavRendererProps` (types only)
- `example-app/app/layout.tsx` does NOT currently call getNav — nav is absent from layout
- `example-app/components/Nav.tsx` accepts `NavRendererProps` and uses `nav.NavData`
- `example-app/cms.config.ts` exports `navPath = 'content/nav.json'` and `contentBase`
- `example-app/app/admin/[[...cms]]/page.tsx` — not yet read, but known to pass navPath

## Files changed

### Package (requires bundle-cms.sh after all changes)
1. `packages/git-cms/src/types/schemas.ts` — add `navEnabled`, `navTitle`, `navOrder`, `navParent` to `PageContent`; update `NavItem` (remove `slug?`, keep `href`/`title`/`children`)
2. `packages/git-cms/src/lib/markdown.ts` — read/write new nav fields
3. `packages/git-cms/src/lib/nav.ts` — add `buildNav(contentDirs, contentBase?)` server-only function; keep `getNav`/`parseNav` for backward compat
4. `packages/git-cms/src/components/Editor.tsx` — add nav fields to "Page settings" panel
5. `packages/git-cms/src/components/Dashboard.tsx` — remove `onOpenNav` prop and Nav card
6. `packages/git-cms/src/components/CMS.tsx` — remove `navPath` prop and `'nav'` view
7. `packages/git-cms/src/next/admin-page.tsx` — remove `navPath` prop and resolution

### Example app
8. `example-app/cms.config.ts` — remove `navPath` export
9. `example-app/app/admin/[[...cms]]/page.tsx` — remove `navPath` prop
10. `example-app/app/layout.tsx` — add Nav import, call `buildNav`
11. `example-app/content/pages/home.md` — add nav frontmatter fields
12. `example-app/content/pages/blogs.md` — add nav frontmatter fields
13. `example-app/content/blog/getting-started.md` — add nav frontmatter fields

### Deletion candidate
- `example-app/content/nav.json` — can be deleted after migration

## buildNav algorithm

```typescript
function buildNav(
  contentDirs: Array<{ localPath: string; urlBase?: string }>,
  options?: { defaultOrder?: number }
): NavData
```

1. For each dir: `fs.readdirSync` recursively, collect `.md` files
2. Parse each with `parseMarkdown`; keep only those where `navEnabled === true`
3. Sort by `navOrder` (ascending, undefined last)
4. For top-level items (no `navParent`): add to root items array
5. For items with `navParent`: find parent by slug match, push to parent.children
6. Orphans (navParent points to non-existent slug): promoted to top-level with console.warn
