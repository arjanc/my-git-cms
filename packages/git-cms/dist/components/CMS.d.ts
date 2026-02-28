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
}
export declare function CMS({ basePath, apiBasePath, contentPath, githubOwner, githubRepo, blockSchemas, pageSchemas, user, signOutUrl, }: CMSProps): React.JSX.Element;
//# sourceMappingURL=CMS.d.ts.map