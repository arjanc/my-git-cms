'use client'

import React from 'react'
import type { BlockSchema, BlockInstance } from '../types/schemas'
import { BlockEditor } from './BlockEditor'
import { ColumnSlot } from './ColumnSlot'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface LayoutBlockEditorProps {
  block: BlockInstance
  schema: BlockSchema
  blockSchemas: BlockSchema[]
  onChange: (updated: BlockInstance) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function LayoutBlockEditor({
  block,
  schema,
  blockSchemas,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LayoutBlockEditorProps) {
  const columnCount = Number(block.columns ?? 2)
  const rawSlots = Array.isArray(block.slots) ? (block.slots as BlockInstance[][]) : []
  // Ensure slots array always matches current column count
  const slots = Array.from({ length: columnCount }, (_, i) => rawSlots[i] ?? [])

  const allowedBlocks = schema.columnsConfig?.allowedBlocks ?? 'any'

  const gridCols: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  function handleColumnCountChange(val: string) {
    const newCount = Number(val)
    const newSlots = Array.from({ length: newCount }, (_, i) => slots[i] ?? [])
    onChange({ ...block, columns: val, slots: newSlots })
  }

  function handleSlotChange(slotIndex: number, slotBlocks: BlockInstance[]) {
    const newSlots = slots.map((slot, i) => (i === slotIndex ? slotBlocks : slot))
    onChange({ ...block, slots: newSlots })
  }

  // Render prop passed to ColumnSlot — avoids circular import
  function renderEditor(
    nestedBlock: BlockInstance,
    onNestedChange: (updated: BlockInstance) => void,
    onNestedRemove: () => void,
    onNestedMoveUp: () => void,
    onNestedMoveDown: () => void
  ) {
    const nestedSchema = blockSchemas.find((s) => s.type === nestedBlock.type)
    if (!nestedSchema) return null
    return (
      <BlockEditor
        key={nestedBlock.id}
        block={nestedBlock}
        schema={nestedSchema}
        blockSchemas={blockSchemas}
        onChange={onNestedChange}
        onRemove={onNestedRemove}
        onMoveUp={onNestedMoveUp}
        onMoveDown={onNestedMoveDown}
      />
    )
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
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Columns</Label>
          <Select
            value={String(block.columns ?? '2')}
            onValueChange={handleColumnCountChange}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 columns</SelectItem>
              <SelectItem value="3">3 columns</SelectItem>
              <SelectItem value="4">4 columns</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`grid ${gridCols[columnCount] ?? 'grid-cols-2'} gap-3`}>
          {slots.map((slotBlocks, i) => (
            <ColumnSlot
              key={i}
              blocks={slotBlocks}
              blockSchemas={blockSchemas}
              allowedBlocks={allowedBlocks}
              onChange={(blocks) => handleSlotChange(i, blocks)}
              renderEditor={renderEditor}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
