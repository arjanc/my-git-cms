import React from 'react'
import type { BlockInstance } from '@git-cms/core'

const RATIO_CLASS: Record<string, string> = {
  '1:1':  'aspect-square',
  '16:9': 'aspect-video',
  '4:3':  'aspect-[4/3]',
  '3:2':  'aspect-[3/2]',
  '21:9': 'aspect-[21/9]',
}

export function MapBlock({ block }: { block: BlockInstance }) {
  const location = String(block.location ?? '').trim()
  if (!location) return null

  const aspectRatio    = String(block.aspectRatio ?? '16:9')
  const showDirections = Boolean(block.showDirections ?? false)
  const openInNewWindow = Boolean(block.openInNewWindow ?? true)

  const encoded       = encodeURIComponent(location)
  const embedUrl      = `https://maps.google.com/maps?q=${encoded}&output=embed`
  const mapsUrl       = `https://www.google.com/maps/search/?api=1&query=${encoded}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
  const ratioClass    = RATIO_CLASS[aspectRatio] ?? 'aspect-video'

  const mapContainer = (
    <div className={`relative w-full ${ratioClass}`}>
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full rounded-lg border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map: ${location}`}
      />
    </div>
  )

  return (
    <figure className="mb-8">
      {openInNewWindow ? (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
          {mapContainer}
        </a>
      ) : (
        mapContainer
      )}
      {showDirections && (
        <div className="mt-3">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Get directions
          </a>
        </div>
      )}
    </figure>
  )
}
