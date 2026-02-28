export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'image'
  | 'dropdown'
  | 'boolean'
  | 'richtext'

export interface FieldSchema {
  /** Key used in the block data object, e.g. "heading" */
  name: string
  /** Human-readable label shown in the admin form */
  label: string
  /** Controls which form widget is rendered */
  fieldType: FieldType
  required?: boolean
  /** For fieldType "dropdown": the available options */
  options?: Array<{ label: string; value: string }>
  /** Default value injected when creating a new block */
  defaultValue?: unknown
}

export interface BlockSchema {
  /** Unique identifier matching the `type` key stored in frontmatter */
  type: string
  /** Human-readable name shown in the admin block picker */
  label: string
  fields: FieldSchema[]
}

export interface PageSchema {
  /** Unique identifier referenced in frontmatter as `pageSchema` */
  type: string
  label: string
  /** Block types allowed on this page, or "any" for no restriction */
  allowedBlocks: string[] | 'any'
  /** Content path prefix where this schema's files live */
  contentPath: string
}

/**
 * A single block instance as stored in frontmatter.
 * `type` must match a registered BlockSchema.type.
 * All other keys are field values from the schema.
 */
export interface BlockInstance {
  id: string
  type: string
  [field: string]: unknown
}

// ─── Navigation / Project Map ─────────────────────────────────────────────

/**
 * A single item in the site navigation tree.
 */
export interface NavItem {
  /** Display text in the navigation */
  title: string
  /** URL path, e.g. "/" or "/blog/my-post" */
  href: string
  /**
   * Optional slug cross-reference. When present this item links to a markdown
   * page whose PageContent.slug equals this value.
   */
  slug?: string
  /** Nested nav items — one level deep in the UI, type allows recursion */
  children?: NavItem[]
}

/** The full navigation document as stored in the JSON file. */
export interface NavData {
  items: NavItem[]
}

/**
 * Props that the example-app's Nav renderer component must satisfy.
 * Import this type in your custom Nav component to get full type safety.
 */
export interface NavRendererProps {
  nav: NavData
  /** Current pathname for active-link highlighting */
  currentPath?: string
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
  contentBase?: string
}

/**
 * The full parsed content of a markdown file.
 * Used by the page renderer and the CMS editor.
 */
export interface PageContent {
  title: string
  slug: string
  description?: string
  /** References a PageSchema.type, e.g. "home" or "blog" */
  pageSchema?: string
  blocks: BlockInstance[]
  metadata?: {
    createdAt?: string
    updatedAt?: string
    author?: string
  }
}
