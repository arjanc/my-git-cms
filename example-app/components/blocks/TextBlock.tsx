import React from 'react'
import type { BlockInstance } from '@git-cms/core'

export function TextBlock({ block }: { block: BlockInstance }) {
  const content = String(block.content ?? '')

  return (
    <div
      className="prose prose-gray max-w-none py-8"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
