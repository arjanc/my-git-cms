import { PageContent, Block } from './block-types';
import matter from 'gray-matter';

/**
 * Serialize page content to markdown with frontmatter
 */
export function serializeToMarkdown(content: PageContent): string {
  const frontmatter = {
    title: content.title,
    slug: content.slug,
    description: content.description,
    blocks: content.blocks,
    metadata: content.metadata,
  };

  const md = matter.stringify('', frontmatter);
  return md;
}

/**
 * Parse markdown with frontmatter to page content
 */
export function parseMarkdown(markdown: string): PageContent {
  const { data } = matter(markdown);
  
  return {
    title: data.title || 'Untitled',
    slug: data.slug || '/',
    description: data.description,
    blocks: data.blocks || [],
    metadata: data.metadata,
  };
}

/**
 * Validate block structure
 */
export function validateBlock(block: any): block is Block {
  if (!block || typeof block !== 'object') return false;
  if (!block.id || !block.type) return false;
  
  // Add more specific validation per block type if needed
  return true;
}

/**
 * Generate a unique block ID
 */
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
