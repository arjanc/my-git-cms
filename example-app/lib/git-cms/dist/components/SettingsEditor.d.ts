import React from 'react';
import type { BlockSchema } from '../types/schemas';
interface SettingsEditorProps {
    settingsPath: string;
    apiBasePath?: string;
    blockSchemas?: BlockSchema[];
    onBack: () => void;
}
export declare function SettingsEditor({ settingsPath, apiBasePath, blockSchemas, onBack, }: SettingsEditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=SettingsEditor.d.ts.map