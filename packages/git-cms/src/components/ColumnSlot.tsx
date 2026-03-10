'use client'

import React, { useState } from 'react'
import type { BlockSchema, BlockInstance } from '../types/schemas'
import { BlockTypePicker } from './BlockTypePicker'
import { Plus } from 'lucide-react'

// Inlined to avoid importing gray-matter in a client component
function generateBlockId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface ColumnSlotProps {
  blocks: BlockInstance[]
  blockSchemas: BlockSchema[]
  allowedBlocks: string[] | 'any'
  onChange: (blocks: BlockInstance[]) => void
  /**
   * Render prop — provided by LayoutBlockEditor to avoid a circular import
   * (ColumnSlot → BlockEditor → LayoutBlockEditor → ColumnSlot).
   */
  renderEditor: (
    block: BlockInstance,
    onChange: (updated: BlockInstance) => void,
    onRemove: () => void,
    onMoveUp: () => void,
    onMoveDown: () => void
  ) => React.ReactNode
}

export function ColumnSlot({
  blocks,
  blockSchemas,
  allowedBlocks,
  onChange,
  renderEditor,
}: ColumnSlotProps) {
  const [showPicker, setShowPicker] = useState(false)

  function handleAdd(type: string) {
    const schema = blockSchemas.find((s) => s.type === type)
    if (!schema) return
    const newBlock: BlockInstance = { id: generateBlockId(), type }
    for (const field of schema.fields) {
      if (field.defaultValue !== undefined) newBlock[field.name] = field.defaultValue
    }
    onChange([...blocks, newBlock])
    setShowPicker(false)
  }

  function handleChange(index: number, updated: BlockInstance) {
    const next = [...blocks]
    next[index] = updated
    onChange(next)
  }

  function handleRemove(index: number) {
    onChange(blocks.filter((_, i) => i !== index))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const next = [...blocks]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  function handleMoveDown(index: number) {
    if (index === blocks.length - 1) return
    const next = [...blocks]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2 min-h-24 rounded-lg border border-dashed border-gray-200 p-2 bg-gray-50/50">
      {blocks.map((block, i) =>
        renderEditor(
          block,
          (updated) => handleChange(i, updated),
          () => handleRemove(i),
          () => handleMoveUp(i),
          () => handleMoveDown(i)
        )
      )}

      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 text-xs font-medium transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add block
      </button>

      {showPicker && (
        <BlockTypePicker
          blockSchemas={blockSchemas}
          allowedBlocks={allowedBlocks}
          onSelect={handleAdd}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
