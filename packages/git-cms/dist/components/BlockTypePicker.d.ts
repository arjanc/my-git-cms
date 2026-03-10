import React from 'react';
import type { BlockSchema } from '../types/schemas';
interface BlockTypePickerProps {
    blockSchemas: BlockSchema[];
    allowedBlocks: string[] | 'any';
    onSelect: (type: string) => void;
    onClose: () => void;
}
export declare function BlockTypePicker({ blockSchemas, allowedBlocks, onSelect, onClose }: BlockTypePickerProps): React.JSX.Element;
export {};
//# sourceMappingURL=BlockTypePicker.d.ts.map