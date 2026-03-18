import React from 'react'
import type { BlockInstance } from '@git-cms/core'

const tagStyles: Record<string, string> = {
  h1: 'text-5xl font-bold',
  h2: 'text-4xl font-bold',
  h3: 'text-3xl font-semibold',
  h4: 'text-2xl font-semibold',
  h5: 'text-xl font-medium',
  h6: 'text-lg font-medium',
}

const alignStyles: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const VALID_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
type HeadingTag = (typeof VALID_TAGS)[number]

export function HeadingBlock({ block }: { block: BlockInstance }) {
  const rawTag = String(block.tag ?? 'h2')
  const tag: HeadingTag = (VALID_TAGS as readonly string[]).includes(rawTag)
    ? (rawTag as HeadingTag)
    : 'h2'
  const text = String(block.text ?? '')
  const alignment = String(block.alignment ?? 'left')
  const alignClass = alignStyles[alignment] ?? alignStyles.left
  const tagClass = tagStyles[tag] ?? tagStyles.h2

  return React.createElement(tag, { className: `after:content-[''] after:block after:h-1 after:w-16 after:bg-primary-500 after:mx-auto after:mt-4 my-8 ${tagClass} ${alignClass}` }, text)
}
