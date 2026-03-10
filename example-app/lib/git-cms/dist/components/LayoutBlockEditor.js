'use client';
import React from 'react';
import { BlockEditor } from './BlockEditor';
import { ColumnSlot } from './ColumnSlot';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
export function LayoutBlockEditor({ block, schema, blockSchemas, onChange, onRemove, onMoveUp, onMoveDown, }) {
    const columnCount = Number(block.columns ?? 2);
    const rawSlots = Array.isArray(block.slots) ? block.slots : [];
    // Ensure slots array always matches current column count
    const slots = Array.from({ length: columnCount }, (_, i) => rawSlots[i] ?? []);
    const allowedBlocks = schema.columnsConfig?.allowedBlocks ?? 'any';
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };
    function handleColumnCountChange(val) {
        const newCount = Number(val);
        const newSlots = Array.from({ length: newCount }, (_, i) => slots[i] ?? []);
        onChange({ ...block, columns: val, slots: newSlots });
    }
    function handleSlotChange(slotIndex, slotBlocks) {
        const newSlots = slots.map((slot, i) => (i === slotIndex ? slotBlocks : slot));
        onChange({ ...block, slots: newSlots });
    }
    // Render prop passed to ColumnSlot — avoids circular import
    function renderEditor(nestedBlock, onNestedChange, onNestedRemove, onNestedMoveUp, onNestedMoveDown) {
        const nestedSchema = blockSchemas.find((s) => s.type === nestedBlock.type);
        if (!nestedSchema)
            return null;
        return (React.createElement(BlockEditor, { key: nestedBlock.id, block: nestedBlock, schema: nestedSchema, blockSchemas: blockSchemas, onChange: onNestedChange, onRemove: onNestedRemove, onMoveUp: onNestedMoveUp, onMoveDown: onNestedMoveDown }));
    }
    return (React.createElement(Card, null,
        React.createElement(CardHeader, { className: "py-3 px-4 flex flex-row items-center justify-between space-y-0" },
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("span", { className: "font-semibold text-sm text-gray-800" }, schema.label),
                React.createElement("span", { className: "text-xs text-gray-400 font-mono" },
                    "#",
                    block.id.slice(-6))),
            React.createElement("div", { className: "flex gap-1" },
                React.createElement(Button, { variant: "outline", size: "sm", onClick: onMoveUp, title: "Move up", className: "h-7 px-2" }, "\u2191"),
                React.createElement(Button, { variant: "outline", size: "sm", onClick: onMoveDown, title: "Move down", className: "h-7 px-2" }, "\u2193"),
                React.createElement(Button, { variant: "outline", size: "sm", onClick: onRemove, title: "Remove block", className: "h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200" }, "Remove"))),
        React.createElement(CardContent, { className: "space-y-4" },
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement(Label, { className: "shrink-0" }, "Columns"),
                React.createElement(Select, { value: String(block.columns ?? '2'), onValueChange: handleColumnCountChange },
                    React.createElement(SelectTrigger, { className: "w-36" },
                        React.createElement(SelectValue, null)),
                    React.createElement(SelectContent, null,
                        React.createElement(SelectItem, { value: "2" }, "2 columns"),
                        React.createElement(SelectItem, { value: "3" }, "3 columns"),
                        React.createElement(SelectItem, { value: "4" }, "4 columns")))),
            React.createElement("div", { className: `grid ${gridCols[columnCount] ?? 'grid-cols-2'} gap-3` }, slots.map((slotBlocks, i) => (React.createElement(ColumnSlot, { key: i, blocks: slotBlocks, blockSchemas: blockSchemas, allowedBlocks: allowedBlocks, onChange: (blocks) => handleSlotChange(i, blocks), renderEditor: renderEditor })))))));
}
