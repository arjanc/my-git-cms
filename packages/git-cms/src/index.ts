// Main exports
export { CMS } from './components/CMS'
export type { CMSProps } from './components/CMS'

// Type exports
export type {
  Block,
  BlockType,
  BaseBlock,
  HeroBlock,
  BannerBlock,
  USPBlock,
  VideoBlock,
  ImageBlock,
  TextBlock,
  PageContent,
} from './types/blocks'

export { createDefaultBlock } from './types/blocks'

// Utility exports
export {
  serializeToMarkdown,
  parseMarkdown,
  validateBlock,
  generateBlockId,
} from './lib/markdown'
