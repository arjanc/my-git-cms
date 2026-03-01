import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { NavData, NavItem } from '../types/schemas'

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
export function buildNav(contentDirs: string[]): NavData {
  interface PageEntry {
    title: string
    href: string
    navTitle?: string
    navOrder?: number
    navParent?: string
  }

  const pages: PageEntry[] = []

  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue
    for (const file of getMarkdownFiles(dir)) {
      try {
        const raw = fs.readFileSync(file, 'utf-8')
        const { data } = matter(raw)
        if (!data.navEnabled || !data.slug) continue
        pages.push({
          title: data.title || 'Untitled',
          href: data.slug as string,
          navTitle: data.navTitle as string | undefined,
          navOrder: data.navOrder as number | undefined,
          navParent: data.navParent as string | undefined,
        })
      } catch {
        // skip unreadable files
      }
    }
  }

  // Sort by navOrder (undefined → Infinity), then alphabetically
  pages.sort((a, b) => {
    const ao = a.navOrder ?? Infinity
    const bo = b.navOrder ?? Infinity
    if (ao !== bo) return ao - bo
    return (a.navTitle || a.title).localeCompare(b.navTitle || b.title)
  })

  // Build NavItem map keyed by href
  const byHref = new Map<string, NavItem>()
  for (const page of pages) {
    byHref.set(page.href, { title: page.navTitle || page.title, href: page.href })
  }

  // Assign each item to its parent or to the top-level list
  const topLevel: NavItem[] = []
  for (const page of pages) {
    const item = byHref.get(page.href)!
    if (page.navParent) {
      const parent = byHref.get(page.navParent)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(item)
        continue
      }
    }
    topLevel.push(item)
  }

  return { items: topLevel }
}

function getMarkdownFiles(dir: string): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...getMarkdownFiles(full))
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(full)
      }
    }
  } catch {
    // skip unreadable directories
  }
  return results
}
