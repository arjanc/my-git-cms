import React from 'react';
interface EditorProps {
    filePath: string | null;
    onBack: () => void;
    basePath: string;
    apiBasePath?: string;
}
export declare function Editor({ filePath, onBack, basePath, apiBasePath }: EditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=Editor.d.ts.map