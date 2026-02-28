import fs from 'fs';
/**
 * Parse a raw JSON string into NavData.
 * Returns { items: [] } on parse failure — never throws.
 * Safe to call in any context (client or server).
 */
export function parseNav(content) {
    try {
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.items)) {
            return parsed;
        }
    }
    catch {
        // malformed or empty file — return safe default
    }
    return { items: [] };
}
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
export function getNav(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return parseNav(raw);
    }
    catch {
        return { items: [] };
    }
}
