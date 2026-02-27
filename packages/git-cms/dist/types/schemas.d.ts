export type FieldType = 'text' | 'textarea' | 'number' | 'image' | 'dropdown' | 'boolean' | 'richtext';
export interface FieldSchema {
    /** Key used in the block data object, e.g. "heading" */
    name: string;
    /** Human-readable label shown in the admin form */
    label: string;
    /** Controls which form widget is rendered */
    fieldType: FieldType;
    required?: boolean;
    /** For fieldType "dropdown": the available options */
    options?: Array<{
        label: string;
        value: string;
    }>;
    /** Default value injected when creating a new block */
    defaultValue?: unknown;
}
export interface BlockSchema {
    /** Unique identifier matching the `type` key stored in frontmatter */
    type: string;
    /** Human-readable name shown in the admin block picker */
    label: string;
    fields: FieldSchema[];
}
export interface PageSchema {
    /** Unique identifier referenced in frontmatter as `pageSchema` */
    type: string;
    label: string;
    /** Block types allowed on this page, or "any" for no restriction */
    allowedBlocks: string[] | 'any';
    /** Content path prefix where this schema's files live */
    contentPath: string;
}
/**
 * A single block instance as stored in frontmatter.
 * `type` must match a registered BlockSchema.type.
 * All other keys are field values from the schema.
 */
export interface BlockInstance {
    id: string;
    type: string;
    [field: string]: unknown;
}
/**
 * The full parsed content of a markdown file.
 * Used by the page renderer and the CMS editor.
 */
export interface PageContent {
    title: string;
    slug: string;
    description?: string;
    /** References a PageSchema.type, e.g. "home" or "blog" */
    pageSchema?: string;
    blocks: BlockInstance[];
    metadata?: {
        createdAt?: string;
        updatedAt?: string;
        author?: string;
    };
}
//# sourceMappingURL=schemas.d.ts.map