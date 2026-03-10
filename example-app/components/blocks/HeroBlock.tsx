import Image from 'next/image'
import type { BlockInstance } from '@git-cms/core'

export function HeroBlock({ block }: { block: BlockInstance }) {
  const heading = String(block.heading ?? '')
  const subheading = String(block.subheading ?? '')
  const subheadingAttribution = String(block.subheadingAttribution ?? '')
  const ctaText = String(block.ctaText ?? '')
  const ctaUrl = String(block.ctaUrl ?? '/')
  const backgroundImage = String(block.backgroundImage ?? '')

  return (
    <section className="relative flex items-center justify-center min-h-[480px] bg-neutral-900 text-white overflow-hidden">
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
    </section>
  )
}
