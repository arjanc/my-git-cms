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
export declare function createDefaultBlock(type: BlockType, id: string): Block;
//# sourceMappingURL=blocks.d.ts.map