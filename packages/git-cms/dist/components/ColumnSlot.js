'use client';
import React, { useState } from 'react';
import { BlockTypePicker } from './BlockTypePicker';
import { Plus } from 'lucide-react';
// Inlined to avoid importing gray-matter in a client component
function generateBlockId() {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function ColumnSlot({ blocks, blockSchemas, allowedBlocks, onChange, renderEditor, }) {
    const [showPicker, setShowPicker] = useState(false);
    function handleAdd(type) {
        const schema = blockSchemas.find((s) => s.type === type);
        if (!schema)
            return;
        const newBlock = { id: generateBlockId(), type };
        for (const field of schema.fields) {
            if (field.defaultValue !== undefined)
                newBlock[field.name] = field.defaultValue;
        }
        onChange([...blocks, newBlock]);
        setShowPicker(false);
    }
    function handleChange(index, updated) {
        const next = [...blocks];
        next[index] = updated;
        onChange(next);
    }
    function handleRemove(index) {
        onChange(blocks.filter((_, i) => i !== index));
    }
    function handleMoveUp(index) {
        if (index === 0)
            return;
        const next = [...blocks];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        onChange(next);
    }
    function handleMoveDown(index) {
        if (index === blocks.length - 1)
            return;
        const next = [...blocks];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        onChange(next);
    }
    return (React.createElement("div", { className: "flex flex-col gap-2 min-h-24 rounded-lg border border-dashed border-gray-200 p-2 bg-gray-50/50" },
        blocks.map((block, i) => renderEditor(block, (updated) => handleChange(i, updated), () => handleRemove(i), () => handleMoveUp(i), () => handleMoveDown(i))),
        React.createElement("button", { onClick: () => setShowPicker(true), className: "flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 text-xs font-medium transition-colors" },
            React.createElement(Plus, { className: "h-3.5 w-3.5" }),
            "Add block"),
        showPicker && (React.createElement(BlockTypePicker, { blockSchemas: blockSchemas, allowedBlocks: allowedBlocks, onSelect: handleAdd, onClose: () => setShowPicker(false) }))));
}
