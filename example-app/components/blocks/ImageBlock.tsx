import Image from 'next/image'
import type { BlockInstance } from '@git-cms/core'

const RATIO_CLASS: Record<string, string> = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '21:9': 'aspect-[21/9]',
}

export function ImageBlock({ block }: { block: BlockInstance }) {
  const url = String(block.url ?? '')
  const alt = String(block.alt ?? '')
  const caption = String(block.caption ?? '')
  const ratioClass = RATIO_CLASS[String(block.aspectRatio ?? '16:9')] ?? 'aspect-video'

  if (!url) return null

  return (
    <figure className="mb-8">
      <div className={`relative w-full ${ratioClass}`}>
        <Image
          src={url}
          alt={alt}
          fill
          className="rounded-lg object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-neutral-500">{caption}</figcaption>
      )}
    </figure>
  )
}
