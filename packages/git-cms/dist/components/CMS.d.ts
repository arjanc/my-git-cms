import React from 'react';
import type { BlockSchema, PageSchema } from '../types/schemas';
export interface CMSProps {
    basePath?: string;
    apiBasePath?: string;
    contentPath?: string;
    githubOwner?: string;
    githubRepo?: string;
    blockSchemas?: BlockSchema[];
    pageSchemas?: PageSchema[];
    user?: {
        name?: string | null;
        image?: string | null;
    };
    signOutUrl?: string;
    /**
     * Absolute GitHub repo path to the nav JSON file.
     * Example: "example-app/content/nav.json"
     * When provided, the Dashboard shows a Navigation card.
     */
    navPath?: string;
}
export declare function CMS({ basePath, apiBasePath, contentPath, githubOwner, githubRepo, blockSchemas, pageSchemas, user, signOutUrl, navPath, }: CMSProps): React.JSX.Element;
//# sourceMappingURL=CMS.d.ts.map