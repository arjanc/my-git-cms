'use client';
import React from 'react';
import { ImageField } from './ImageField';
import { RichTextEditor } from './RichTextEditor';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
function FieldEditor({ field, value, onChange }) {
    const strVal = value !== undefined && value !== null
        ? typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : String(value)
        : '';
    switch (field.fieldType) {
        case 'text':
            return (React.createElement(Input, { value: strVal, onChange: (e) => onChange(e.target.value), placeholder: field.label }));
        case 'image':
            return React.createElement(ImageField, { field: field, value: strVal, onChange: onChange });
        case 'richtext':
            return React.createElement(RichTextEditor, { value: strVal, onChange: (val) => onChange(val) });
        case 'textarea':
            return (React.createElement(Textarea, { value: strVal, rows: 4, onChange: (e) => onChange(e.target.value), className: "font-mono", placeholder: field.label }));
        case 'number':
            return (React.createElement(Input, { type: "number", value: strVal, onChange: (e) => onChange(e.target.value === '' ? undefined : Number(e.target.value)) }));
        case 'boolean':
            return (React.createElement("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => onChange(e.target.checked), className: "h-4 w-4 rounded border-gray-300" }));
        case 'dropdown':
            return (React.createElement(Select, { value: strVal, onValueChange: (val) => onChange(val) },
                React.createElement(SelectTrigger, null,
                    React.createElement(SelectValue, { placeholder: field.label })),
                React.createElement(SelectContent, null, (field.options ?? []).map((opt) => (React.createElement(SelectItem, { key: opt.value, value: opt.value }, opt.label))))));
        default:
            return null;
    }
}
export function BlockEditor({ block, schema, onChange, onRemove, onMoveUp, onMoveDown, }) {
    function handleField(name, val) {
        onChange({ ...block, [name]: val });
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
        React.createElement(CardContent, { className: "space-y-4" }, schema.fields.map((field) => (React.createElement("div", { key: field.name, className: "space-y-1.5" },
            React.createElement(Label, null,
                field.label,
                field.required && React.createElement("span", { className: "text-red-500 ml-1" }, "*")),
            React.createElement(FieldEditor, { field: field, value: block[field.name], onChange: (val) => handleField(field.name, val) })))))));
}
