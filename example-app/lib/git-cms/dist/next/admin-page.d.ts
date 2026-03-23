import React from 'react';
import type { BlockSchema, PageSchema } from '../types/schemas';
interface AdminPageProps {
    blockSchemas?: BlockSchema[];
    pageSchemas?: PageSchema[];
    /**
     * Prefix applied to every PageSchema.contentPath that does not start with '/'.
     * Set this to the subdirectory where your Next.js app lives within the repo.
     *
     * Example: contentBase='example-app' + schema.contentPath='content/pages'
     *          → GitHub path 'example-app/content/pages'
     *
     * Omit (or leave empty) when the Next.js app is at the repo root.
     */
    contentBase?: string;
    /**
     * Repo-relative path to the settings JSON file.
     * Defaults to <contentBase>/content/settings.json (or content/settings.json when no contentBase).
     */
    settingsPath?: string;
}
export default function AdminPage({ blockSchemas, pageSchemas, contentBase, settingsPath, }?: AdminPageProps): Promise<React.FunctionComponentElement<import("..").CMSProps>>;
export {};
//# sourceMappingURL=admin-page.d.ts.map