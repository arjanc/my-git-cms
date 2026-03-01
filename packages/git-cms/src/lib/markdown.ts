import matter from 'gray-matter'
import type { PageContent, BlockInstance } from '../types/schemas'

export function serializeToMarkdown(content: PageContent): string {
  const raw: Record<string, unknown> = {
    title: content.title,
    slug: content.slug,
    description: content.description,
    pageSchema: content.pageSchema,
    blocks: content.blocks,
    metadata: content.metadata,
    navEnabled: content.navEnabled,
    navTitle: content.navTitle,
    navOrder: content.navOrder,
    navParent: content.navParent,
  }
  // js-yaml cannot serialize undefined — drop any key whose value is undefined
  const frontmatter = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  )
  return matter.stringify('', frontmatter)
}

export function parseMarkdown(markdown: string): PageContent {
  const { data } = matter(markdown)
  return {
    title: data.title || 'Untitled',
    slug: data.slug || '/',
    description: data.description,
    pageSchema: data.pageSchema,
    blocks: (data.blocks as BlockInstance[]) || [],
    metadata: data.metadata,
    navEnabled: data.navEnabled,
    navTitle: data.navTitle,
    navOrder: data.navOrder,
    navParent: data.navParent,
  }
}

export function validateBlock(block: unknown): block is BlockInstance {
  if (!block || typeof block !== 'object') return false
  const b = block as Record<string, unknown>
  return typeof b.id === 'string' && typeof b.type === 'string'
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
