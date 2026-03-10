'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import type { BlockInstance } from '@git-cms/core'

export function HeroBlock({ block }: { block: BlockInstance }) {
  const heading = String(block.heading ?? '')
  const subheading = String(block.subheading ?? '')
  const subheadingAttribution = String(block.subheadingAttribution ?? '')
  const ctaText = String(block.ctaText ?? '')
  const ctaUrl = String(block.ctaUrl ?? '/')

  // Support string[] (new imagelist format), newline-separated string (legacy), or single backgroundImage
  const images: string[] = Array.isArray(block.backgroundImages)
    ? (block.backgroundImages as string[]).filter(Boolean)
    : String(block.backgroundImages ?? '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)

  if (images.length === 0 && block.backgroundImage) {
    images.push(String(block.backgroundImage))
  }

  const [current, setCurrent] = useState(0)
  const isCarousel = images.length > 1

  const prev = useCallback(
    () => setCurrent(i => (i - 1 + images.length) % images.length),
    [images.length]
  )
  const next = useCallback(
    () => setCurrent(i => (i + 1) % images.length),
    [images.length]
  )

  return (
    <section className="relative flex items-center justify-center min-h-[480px] bg-neutral-900 text-white overflow-hidden">
      {/* Sliding image track */}
      {images.length > 0 && (
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${current * (100 / images.length)}%)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="relative"
              style={{ width: `${100 / images.length}%`, height: '100%' }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dark overlay */}
      {images.length > 0 && <div className="absolute inset-0 bg-black/50" />}

      {/* Text content — fixed on top, does not scroll with the carousel */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl text-primary-50 md:text-6xl font-bold mb-4">{heading}</h1>
        <blockquote className="text-xl md:text-2xl mb-8 text-neutral-200 italic">
          {subheading && (
            <p className="relative inline-block">
              <span className="text-4xl mr-1 leading-none align-top">&ldquo;</span>
              {subheading}
              <span className="text-4xl ml-1 leading-none align-bottom">&rdquo;</span>
            </p>
          )}
          {subheadingAttribution && (
            <p className="mt-6 text-sm md:text-base text-neutral-400 not-italic font-medium tracking-wide">
              &mdash; {subheadingAttribution}
            </p>
          )}
        </blockquote>
        {ctaText && (
          <a
            href={ctaUrl}
            className="inline-block no-underline px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>

      {/* Carousel controls — only shown when 2+ images */}
      {isCarousel && (
        <>
          {/* Previous arrow */}
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`rounded-full bg-white transition-all duration-300 ${
                  i === current
                    ? 'w-4 h-4 opacity-100'
                    : 'w-2.5 h-2.5 opacity-50 hover:opacity-75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
