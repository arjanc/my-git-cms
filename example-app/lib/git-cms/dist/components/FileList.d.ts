import React from 'react';
interface FileListProps {
    onSelectFile: (file: string) => void;
    onBack: () => void;
    contentPath: string;
    apiBasePath?: string;
}
export declare function FileList({ onSelectFile, onBack, contentPath, apiBasePath }: FileListProps): React.JSX.Element;
export {};
//# sourceMappingURL=FileList.d.ts.map