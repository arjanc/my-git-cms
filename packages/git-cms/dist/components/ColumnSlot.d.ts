import React from 'react';
import type { BlockSchema, BlockInstance } from '../types/schemas';
interface ColumnSlotProps {
    blocks: BlockInstance[];
    blockSchemas: BlockSchema[];
    allowedBlocks: string[] | 'any';
    onChange: (blocks: BlockInstance[]) => void;
    /**
     * Render prop — provided by LayoutBlockEditor to avoid a circular import
     * (ColumnSlot → BlockEditor → LayoutBlockEditor → ColumnSlot).
     */
    renderEditor: (block: BlockInstance, onChange: (updated: BlockInstance) => void, onRemove: () => void, onMoveUp: () => void, onMoveDown: () => void) => React.ReactNode;
}
export declare function ColumnSlot({ blocks, blockSchemas, allowedBlocks, onChange, renderEditor, }: ColumnSlotProps): React.JSX.Element;
export {};
//# sourceMappingURL=ColumnSlot.d.ts.map