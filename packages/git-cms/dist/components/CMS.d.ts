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
}
export declare function CMS({ basePath, apiBasePath, contentPath, githubOwner, githubRepo, blockSchemas, pageSchemas, }: CMSProps): React.JSX.Element;
//# sourceMappingURL=CMS.d.ts.map