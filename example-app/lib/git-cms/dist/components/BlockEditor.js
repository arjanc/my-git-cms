'use client';
import React from 'react';
import { ImageField } from './ImageField';
function FieldEditor({ field, value, onChange }) {
    // Serialize value to string, using JSON for objects/arrays
    const strVal = value !== undefined && value !== null
        ? typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : String(value)
        : '';
    const base = 'w-full border rounded px-3 py-2 text-sm';
    switch (field.fieldType) {
        case 'text':
            return (React.createElement("input", { type: "text", value: strVal, onChange: (e) => onChange(e.target.value), className: base, placeholder: field.label }));
        case 'image':
            return (React.createElement(ImageField, { field: field, value: strVal, onChange: onChange }));
        case 'textarea':
        case 'richtext': {
            const rows = field.fieldType === 'richtext' ? 8 : 4;
            return (React.createElement("textarea", { value: strVal, rows: rows, onChange: (e) => {
                    // Try JSON parse first (handles serialised arrays/objects)
                    try {
                        onChange(JSON.parse(e.target.value));
                    }
                    catch {
                        onChange(e.target.value);
                    }
                }, className: `${base} font-mono`, placeholder: field.label }));
        }
        case 'number':
            return (React.createElement("input", { type: "number", value: strVal, onChange: (e) => onChange(e.target.value === '' ? undefined : Number(e.target.value)), className: base }));
        case 'boolean':
            return (React.createElement("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => onChange(e.target.checked), className: "h-4 w-4" }));
        case 'dropdown':
            return (React.createElement("select", { value: strVal, onChange: (e) => onChange(e.target.value), className: base }, (field.options ?? []).map((opt) => (React.createElement("option", { key: opt.value, value: opt.value }, opt.label)))));
        default:
            return null;
    }
}
export function BlockEditor({ block, schema, onChange, onRemove, onMoveUp, onMoveDown, }) {
    function handleField(name, val) {
        onChange({ ...block, [name]: val });
    }
    return (React.createElement("div", { className: "border rounded-lg p-4 bg-white shadow-sm space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h3", { className: "font-semibold text-sm text-gray-700" },
                schema.label,
                React.createElement("span", { className: "ml-2 text-xs text-gray-400 font-mono" },
                    "#",
                    block.id.slice(-6))),
            React.createElement("div", { className: "flex gap-1" },
                React.createElement("button", { onClick: onMoveUp, className: "px-2 py-1 text-xs border rounded hover:bg-gray-50", title: "Move up" }, "\u2191"),
                React.createElement("button", { onClick: onMoveDown, className: "px-2 py-1 text-xs border rounded hover:bg-gray-50", title: "Move down" }, "\u2193"),
                React.createElement("button", { onClick: onRemove, className: "px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50", title: "Remove block" }, "Remove"))),
        schema.fields.map((field) => (React.createElement("div", { key: field.name, className: "space-y-1" },
            React.createElement("label", { className: "block text-xs font-medium text-gray-600" },
                field.label,
                field.required && React.createElement("span", { className: "text-red-500 ml-1" }, "*")),
            React.createElement(FieldEditor, { field: field, value: block[field.name], onChange: (val) => handleField(field.name, val) }))))));
}
