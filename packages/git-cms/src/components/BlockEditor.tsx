'use client'

import React from 'react'
import type { BlockSchema, FieldSchema, BlockInstance } from '../types/schemas'
import { ImageField } from './ImageField'
import { RichTextEditor } from './RichTextEditor'

interface FieldEditorProps {
  field: FieldSchema
  value: unknown
  onChange: (val: unknown) => void
}

function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  // Serialize value to string, using JSON for objects/arrays
  const strVal =
    value !== undefined && value !== null
      ? typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value)
      : ''

  const base = 'w-full border rounded px-3 py-2 text-sm'

  switch (field.fieldType) {
    case 'text':
      return (
        <input
          type="text"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={base}
          placeholder={field.label}
        />
      )

    case 'image':
      return (
        <ImageField
          field={field}
          value={strVal}
          onChange={onChange}
        />
      )

    case 'richtext':
      return (
        <RichTextEditor
          value={strVal}
          onChange={(val) => onChange(val)}
        />
      )

    case 'textarea':
      return (
        <textarea
          value={strVal}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} font-mono`}
          placeholder={field.label}
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={strVal}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value))
          }
          className={base}
        />
      )

    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
      )

    case 'dropdown':
      return (
        <select
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )

    default:
      return null
  }
}

interface BlockEditorProps {
  block: BlockInstance
  schema: BlockSchema
  onChange: (updated: BlockInstance) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function BlockEditor({
  block,
  schema,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: BlockEditorProps) {
  function handleField(name: string, val: unknown) {
    onChange({ ...block, [name]: val })
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700">
          {schema.label}
          <span className="ml-2 text-xs text-gray-400 font-mono">
            #{block.id.slice(-6)}
          </span>
        </h3>
        <div className="flex gap-1">
          <button
            onClick={onMoveUp}
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
            title="Remove block"
          >
            Remove
          </button>
        </div>
      </div>

      {schema.fields.map((field) => (
        <div key={field.name} className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <FieldEditor
            field={field}
            value={block[field.name]}
            onChange={(val) => handleField(field.name, val)}
          />
        </div>
      ))}
    </div>
  )
}
