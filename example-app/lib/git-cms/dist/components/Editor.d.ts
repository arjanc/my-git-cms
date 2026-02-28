import React from 'react';
import type { BlockSchema, PageSchema } from '../types/schemas';
interface EditorProps {
    filePath: string | null;
    /** When true, the editor is in create-new-file mode (no existing file to load) */
    isCreating?: boolean;
    /** Directory path where the new file will be created, e.g. 'example-app/content/pages' */
    contentPath?: string;
    onBack: () => void;
    /** Called after a new file is successfully committed, with its full repo path */
    onCreated?: (filePath: string) => void;
    basePath: string;
    apiBasePath?: string;
    blockSchemas?: BlockSchema[];
    pageSchemas?: PageSchema[];
}
export declare function Editor({ filePath, isCreating, contentPath, onBack, onCreated, apiBasePath, blockSchemas, pageSchemas, }: EditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=Editor.d.ts.map