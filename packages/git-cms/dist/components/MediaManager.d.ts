import React from 'react';
interface MediaManagerProps {
    apiBasePath?: string;
    mediaPath?: string;
    contentBase?: string;
    onSelect?: (url: string) => void;
    onClose?: () => void;
    isLibraryView?: boolean;
}
export declare function MediaManager({ apiBasePath, mediaPath, contentBase, onSelect, onClose, isLibraryView, }: MediaManagerProps): React.JSX.Element;
export {};
//# sourceMappingURL=MediaManager.d.ts.map