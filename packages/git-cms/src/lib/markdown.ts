import matter from 'gray-matter';
import type { PageContent, Block } from '../types/blocks';

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

export function validateBlock(block: any): block is Block {
  if (!block || typeof block !== 'object') return false;
  if (!block.id || !block.type) return false;
  return true;
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
