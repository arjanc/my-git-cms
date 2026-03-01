import Image from 'next/image'
import type { BlockInstance } from '@git-cms/core'

export function ImageBlock({ block }: { block: BlockInstance }) {
  const url = String(block.url ?? '')
  const alt = String(block.alt ?? '')
  const caption = String(block.caption ?? '')

  if (!url) return null

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-video">
        <Image
          src={url}
          alt={alt}
          fill
          className="rounded-lg object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">{caption}</figcaption>
      )}
    </figure>
  )
}
