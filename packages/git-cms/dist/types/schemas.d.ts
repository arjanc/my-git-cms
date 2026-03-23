export type FieldType = 'text' | 'textarea' | 'number' | 'image' | 'imagelist' | 'dropdown' | 'boolean' | 'richtext' | 'pagepicker';
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
    /**
     * For fieldType "pagepicker": the content directory path to list pages from.
     * Should include contentBase, e.g. "example-app/content/pages".
     */
    contentPath?: string;
}
export interface BlockSchema {
    /** Unique identifier matching the `type` key stored in frontmatter */
    type: string;
    /** Human-readable name shown in the admin block picker */
    label: string;
    fields: FieldSchema[];
    /**
     * Only relevant when type === 'layout'.
     * Controls which block types users can add inside column slots.
     * Omit or set to 'any' to allow all non-layout blocks.
     */
    columnsConfig?: {
        allowedBlocks: string[] | 'any';
    };
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
 * A single item in the assembled site navigation tree.
 * Derived at runtime from page frontmatter — never stored standalone.
 */
export interface NavItem {
    /** Display text (from page navTitle, falls back to page title) */
    title: string;
    /** URL path derived from the page slug, e.g. "/" or "/blog/my-post" */
    href: string;
    /** Nested items assembled from pages whose navParent equals this item's href */
    children?: NavItem[];
}
/** The assembled site navigation. Derived at runtime from page frontmatter. */
export interface NavData {
    items: NavItem[];
}
/**
 * Props that the example-app's Nav renderer component must satisfy.
 * Import this type in your custom Nav component to get full type safety.
 */
export interface NavRendererProps {
    nav: NavData;
    /** Current pathname for active-link highlighting */
    currentPath?: string;
}
/**
 * Global configuration for AdminPage.
 * contentBase is prepended to any PageSchema.contentPath that does not start
 * with a slash. Leave empty when the Next.js app is at the repo root.
 *
 * Example:
 *   contentBase: 'example-app'
 *   schema.contentPath: 'content/pages'
 *   resolved GitHub path: 'example-app/content/pages'
 */
export interface CMSConfig {
    contentBase?: string;
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
    /** Include this page in the assembled site navigation */
    navEnabled?: boolean;
    /** Display text in nav; falls back to title when absent */
    navTitle?: string;
    /** Sort position within nav group (ascending); undefined sorts last */
    navOrder?: number;
    /** href of the parent nav item, e.g. "/about" — makes this a child item */
    navParent?: string;
}
/**
 * Global site settings stored in content/settings.json.
 * Covers general meta, SEO, and footer blocks.
 */
export interface SiteSettings {
    siteName?: string;
    siteDescription?: string;
    author?: string;
    /** BCP 47 language tag, e.g. "en" or "nl" */
    language?: string;
    /** Absolute URL or path, e.g. "/favicon.ico" */
    faviconUrl?: string;
    /** CSS color value used as browser theme-color */
    themeColor?: string;
    /** Full base URL for canonical links, e.g. "https://example.com" */
    canonicalBase?: string;
    /** robots meta content, e.g. "index, follow" */
    robotsDirectives?: string;
    /** Default Open Graph image URL */
    ogImageUrl?: string;
    footerBlocks?: BlockInstance[];
}
export interface MediaItem {
    filename: string;
    title?: string;
    labels?: string[];
}
export interface MediaData {
    images: MediaItem[];
    labels?: string[];
}
//# sourceMappingURL=schemas.d.ts.map