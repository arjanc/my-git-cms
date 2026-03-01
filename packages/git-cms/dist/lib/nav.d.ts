import type { NavData } from '../types/schemas';
/**
 * Assemble the site navigation from the frontmatter of every markdown file
 * found in the given content directories.
 *
 * Only pages with `navEnabled: true` in their frontmatter are included.
 * The tree is sorted by `navOrder` (ascending; undefined sorts last),
 * then alphabetically by nav title. Pages whose `navParent` matches
 * another page's `slug` become child items.
 *
 * Call this in Server Components, generateStaticParams, or layout.tsx.
 * All paths must be absolute filesystem paths.
 *
 * @example
 * import path from 'path'
 * import { buildNav } from '@git-cms/core/nav'
 * const nav = buildNav([
 *   path.join(process.cwd(), 'content', 'pages'),
 *   path.join(process.cwd(), 'content', 'blog'),
 * ])
 */
export declare function buildNav(contentDirs: string[]): NavData;
//# sourceMappingURL=nav.d.ts.map