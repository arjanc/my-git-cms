import type { SiteSettings } from '../types/schemas';
export declare function parseSettings(json: string): SiteSettings;
export declare function serializeSettings(settings: SiteSettings): string;
/**
 * Server-side only: reads and parses content/settings.json from the filesystem.
 * Returns an empty object if the file doesn't exist or cannot be parsed.
 */
export declare function getSettings(absoluteFilePath: string): SiteSettings;
//# sourceMappingURL=settings.d.ts.map