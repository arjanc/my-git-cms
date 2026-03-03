import React from 'react';
interface FileListProps {
    onSelectFile: (file: string) => void;
    onCreateNew: () => void;
    onBack: () => void;
    contentPath: string;
    apiBasePath?: string;
}
export declare function FileList({ onSelectFile, onCreateNew, onBack, contentPath, apiBasePath, }: FileListProps): React.JSX.Element;
export {};
//# sourceMappingURL=FileList.d.ts.map