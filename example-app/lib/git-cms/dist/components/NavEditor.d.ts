import React from 'react';
export interface NavEditorProps {
    /** Absolute GitHub repo path to the nav JSON file, e.g. "example-app/content/nav.json" */
    navPath: string;
    apiBasePath: string;
    onBack: () => void;
}
export declare function NavEditor({ navPath, apiBasePath, onBack }: NavEditorProps): React.JSX.Element;
//# sourceMappingURL=NavEditor.d.ts.map