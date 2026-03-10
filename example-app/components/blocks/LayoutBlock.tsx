import React from 'react'
import type { BlockInstance } from '@git-cms/core'

interface LayoutBlockProps {
  block: BlockInstance
  renderBlock: (block: BlockInstance) => React.ReactNode
}

const gridCols: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function LayoutBlock({ block, renderBlock }: LayoutBlockProps) {
  const columns = Number(block.columns ?? 2)
  const slots = (block.slots ?? []) as BlockInstance[][]

  return (
    <div className={`grid ${gridCols[columns] ?? 'grid-cols-2'} gap-6 px-6 py-4`}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          {(slots[i] ?? []).map((nested) => (
            <React.Fragment key={nested.id}>{renderBlock(nested)}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  )
}
