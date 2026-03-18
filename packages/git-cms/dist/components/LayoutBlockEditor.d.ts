import React from 'react';
import type { BlockSchema, BlockInstance } from '../types/schemas';
interface LayoutBlockEditorProps {
    block: BlockInstance;
    schema: BlockSchema;
    blockSchemas: BlockSchema[];
    onChange: (updated: BlockInstance) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    apiBasePath?: string;
}
export declare function LayoutBlockEditor({ block, schema, blockSchemas, onChange, onRemove, onMoveUp, onMoveDown, apiBasePath, }: LayoutBlockEditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=LayoutBlockEditor.d.ts.map