import matter from 'gray-matter'
import type { PageContent, BlockInstance } from '../types/schemas'

export function serializeToMarkdown(content: PageContent): string {
  const frontmatter = {
    title: content.title,
    slug: content.slug,
    description: content.description,
    pageSchema: content.pageSchema,
    blocks: content.blocks,
    metadata: content.metadata,
  }
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
