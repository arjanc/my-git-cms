'use client'

import React from 'react'
import type { BlockSchema, FieldSchema, BlockInstance } from '../types/schemas'
import { ImageField } from './ImageField'
import { RichTextEditor } from './RichTextEditor'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface FieldEditorProps {
  field: FieldSchema
  value: unknown
  onChange: (val: unknown) => void
}

function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  const strVal =
    value !== undefined && value !== null
      ? typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value)
      : ''

  switch (field.fieldType) {
    case 'text':
      return (
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.label}
        />
      )

    case 'image':
      return <ImageField field={field} value={strVal} onChange={onChange} />

    case 'richtext':
      return <RichTextEditor value={strVal} onChange={(val) => onChange(val)} />

    case 'textarea':
      return (
        <Textarea
          value={strVal}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
          placeholder={field.label}
        />
      )

    case 'number':
      return (
        <Input
          type="number"
          value={strVal}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value))
          }
        />
      )

    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
      )

    case 'dropdown':
      return (
        <Select value={strVal} onValueChange={(val) => onChange(val)}>
          <SelectTrigger>
            <SelectValue placeholder={field.label} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
    <Card>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800">{schema.label}</span>
          <span className="text-xs text-gray-400 font-mono">#{block.id.slice(-6)}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onMoveUp} title="Move up" className="h-7 px-2">
            ↑
          </Button>
          <Button variant="outline" size="sm" onClick={onMoveDown} title="Move down" className="h-7 px-2">
            ↓
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            title="Remove block"
            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            Remove
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {schema.fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <FieldEditor
              field={field}
              value={block[field.name]}
              onChange={(val) => handleField(field.name, val)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
