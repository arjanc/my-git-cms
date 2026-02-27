import type { PageContent, Block } from '../types/blocks';
export declare function serializeToMarkdown(content: PageContent): string;
export declare function parseMarkdown(markdown: string): PageContent;
export declare function validateBlock(block: any): block is Block;
export declare function generateBlockId(): string;
//# sourceMappingURL=markdown.d.ts.map