import type { PageContent, BlockInstance } from '../types/schemas';
export declare function serializeToMarkdown(content: PageContent): string;
export declare function parseMarkdown(markdown: string): PageContent;
export declare function validateBlock(block: unknown): block is BlockInstance;
export declare function generateBlockId(): string;
//# sourceMappingURL=markdown.d.ts.map