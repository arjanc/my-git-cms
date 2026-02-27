// Block type definitions

export type BlockType = 'hero' | 'banner' | 'usp' | 'video' | 'image' | 'text';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
}

export interface BannerBlock extends BaseBlock {
  type: 'banner';
  text: string;
  variant: 'info' | 'warning' | 'success';
  dismissible?: boolean;
}

export interface USPBlock extends BaseBlock {
  type: 'usp';
  title?: string;
  items: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  url: string;
  title?: string;
  description?: string;
  autoplay?: boolean;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  variant?: 'prose' | 'heading' | 'paragraph';
}

export type Block = HeroBlock | BannerBlock | USPBlock | VideoBlock | ImageBlock | TextBlock;

export interface PageContent {
  title: string;
  slug: string;
  description?: string;
  blocks: Block[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    author?: string;
  };
}

export function createDefaultBlock(type: BlockType, id: string): Block {
  const baseBlock = { id, type };
  
  switch (type) {
    case 'hero':
      return {
        ...baseBlock,
        type: 'hero',
        heading: 'New Hero Section',
        subheading: 'Add your subheading here',
      } as HeroBlock;
    
    case 'banner':
      return {
        ...baseBlock,
        type: 'banner',
        text: 'Important announcement',
        variant: 'info',
      } as BannerBlock;
    
    case 'usp':
      return {
        ...baseBlock,
        type: 'usp',
        title: 'Why Choose Us',
        items: [
          { title: 'Fast', description: 'Lightning quick performance' },
          { title: 'Secure', description: 'Enterprise-grade security' },
          { title: 'Scalable', description: 'Grows with your needs' },
        ],
      } as USPBlock;
    
    case 'video':
      return {
        ...baseBlock,
        type: 'video',
        url: '',
        title: 'Video Title',
      } as VideoBlock;
    
    case 'image':
      return {
        ...baseBlock,
        type: 'image',
        url: '',
        alt: 'Image description',
      } as ImageBlock;
    
    case 'text':
      return {
        ...baseBlock,
        type: 'text',
        content: 'Start writing your content here...',
        variant: 'prose',
      } as TextBlock;
    
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}
