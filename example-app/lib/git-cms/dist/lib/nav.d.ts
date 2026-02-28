import type { NavData } from '../types/schemas';
/**
 * Parse a raw JSON string into NavData.
 * Returns { items: [] } on parse failure — never throws.
 * Safe to call in any context (client or server).
 */
export declare function parseNav(content: string): NavData;
/**
 * Read and parse the nav JSON from the local filesystem.
 * Call this in Server Components, generateStaticParams, or layout.tsx.
 * filePath must be an absolute path.
 *
 * @example
 * // example-app/app/layout.tsx
 * import path from 'path'
 * import { getNav } from '@git-cms/core/nav'
 * const nav = getNav(path.join(process.cwd(), 'content', 'nav.json'))
 */
export declare function getNav(filePath: string): NavData;
//# sourceMappingURL=nav.d.ts.map