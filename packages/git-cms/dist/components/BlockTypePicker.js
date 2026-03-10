'use client';
import React from 'react';
import { Button } from './ui/button';
export function BlockTypePicker({ blockSchemas, allowedBlocks, onSelect, onClose }) {
    const available = blockSchemas.filter((s) => s.type !== 'layout' && (allowedBlocks === 'any' || allowedBlocks.includes(s.type)));
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", onClick: onClose },
        React.createElement("div", { className: "bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4", onClick: (e) => e.stopPropagation() },
            React.createElement("h3", { className: "text-sm font-semibold text-gray-800 mb-4" }, "Choose a block type"),
            React.createElement("div", { className: "flex flex-col gap-2" },
                available.map((schema) => (React.createElement("button", { key: schema.type, onClick: () => onSelect(schema.type), className: "text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-colors" }, schema.label))),
                available.length === 0 && (React.createElement("p", { className: "text-sm text-gray-400 text-center py-4" }, "No block types available."))),
            React.createElement(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "mt-4 w-full" }, "Cancel"))));
}
