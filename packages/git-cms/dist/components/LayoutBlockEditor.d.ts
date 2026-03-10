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
}
export declare function LayoutBlockEditor({ block, schema, blockSchemas, onChange, onRemove, onMoveUp, onMoveDown, }: LayoutBlockEditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=LayoutBlockEditor.d.ts.map