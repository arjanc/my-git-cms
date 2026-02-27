import React from 'react';
import type { BlockSchema } from '../types/schemas';
interface EditorProps {
    filePath: string | null;
    onBack: () => void;
    basePath: string;
    apiBasePath?: string;
    blockSchemas?: BlockSchema[];
}
export declare function Editor({ filePath, onBack, apiBasePath, blockSchemas, }: EditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=Editor.d.ts.map