import React from 'react'
import type { BlockInstance } from '@git-cms/core'

export function ImageBlock({ block }: { block: BlockInstance }) {
  const url = String(block.url ?? '')
  const alt = String(block.alt ?? '')
  const caption = String(block.caption ?? '')

  if (!url) return null

  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="w-full rounded-lg" />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">{caption}</figcaption>
      )}
    </figure>
  )
}
