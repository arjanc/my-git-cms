// Main exports
export { CMS } from './components/CMS'
export type { CMSProps } from './components/CMS'

// Schema type exports (new generic schema system)
export type {
  FieldType,
  FieldSchema,
  BlockSchema,
  PageSchema,
  BlockInstance,
  PageContent,
  NavItem,
  NavData,
  NavRendererProps,
} from './types/schemas'

// Legacy block type exports (kept for backward compatibility)
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
} from './types/blocks'

export { createDefaultBlock } from './types/blocks'

// Utility exports
export {
  serializeToMarkdown,
  parseMarkdown,
  validateBlock,
  generateBlockId,
} from './lib/markdown'
