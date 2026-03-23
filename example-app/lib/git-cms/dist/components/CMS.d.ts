import React from 'react';
import type { BlockSchema, PageSchema } from '../types/schemas';
export interface CMSProps {
    basePath?: string;
    apiBasePath?: string;
    contentPath?: string;
    /** Repo-relative path to the settings JSON file, e.g. "example-app/content/settings.json" */
    settingsPath?: string;
    githubOwner?: string;
    githubRepo?: string;
    blockSchemas?: BlockSchema[];
    pageSchemas?: PageSchema[];
    user?: {
        name?: string | null;
        image?: string | null;
    };
    signOutUrl?: string;
}
export declare function CMS(props: CMSProps): React.JSX.Element;
//# sourceMappingURL=CMS.d.ts.map