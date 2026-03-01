import React from 'react'
import Image from 'next/image'
import type { BlockInstance } from '@git-cms/core'

export function HeroBlock({ block }: { block: BlockInstance }) {
  const heading = String(block.heading ?? '')
  const subheading = String(block.subheading ?? '')
  const ctaText = String(block.ctaText ?? '')
  const ctaUrl = String(block.ctaUrl ?? '/')
  const backgroundImage = String(block.backgroundImage ?? '')

  return (
    <section className="relative flex items-center justify-center min-h-[480px] bg-gray-900 text-white overflow-hidden">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          priority
        />
      )}
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{heading}</h1>
        {subheading && <p className="text-xl md:text-2xl mb-8 text-gray-200">{subheading}</p>}
        {ctaText && (
          <a
            href={ctaUrl}
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
