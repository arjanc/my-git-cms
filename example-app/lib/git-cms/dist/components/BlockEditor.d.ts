import React from 'react';
import type { BlockSchema, BlockInstance } from '../types/schemas';
interface BlockEditorProps {
    block: BlockInstance;
    schema: BlockSchema;
    onChange: (updated: BlockInstance) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}
export declare function BlockEditor({ block, schema, onChange, onRemove, onMoveUp, onMoveDown, }: BlockEditorProps): React.JSX.Element;
export {};
//# sourceMappingURL=BlockEditor.d.ts.map