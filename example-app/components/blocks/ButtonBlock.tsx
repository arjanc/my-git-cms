import React from 'react'
import Link from 'next/link'
import type { BlockInstance } from '@git-cms/core'

const variantStyles: Record<string, string> = {
  primary:   'bg-primary-600 hover:bg-primary-700 text-white border-transparent',
  secondary: 'bg-white hover:bg-neutral-50 text-primary-700 border-primary-600',
  clean:     'bg-transparent hover:bg-neutral-100 text-neutral-700 border-transparent underline-offset-4 hover:underline',
}

const sizeStyles: Record<string, string> = {
  small:  'px-4 py-1.5 text-sm rounded',
  medium: 'px-6 py-2.5 text-base rounded-lg',
  large:  'px-8 py-3.5 text-lg rounded-xl',
}

const alignStyles: Record<string, string> = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
}

export function ButtonBlock({ block }: { block: BlockInstance }) {
  const label     = String(block.label     ?? 'Click here')
  const url       = String(block.url       ?? '/')
  const variant   = String(block.variant   ?? 'primary')
  const target    = String(block.target    ?? 'self')
  const size      = String(block.size      ?? 'medium')
  const alignment = String(block.alignment ?? 'left')

  const variantClass = variantStyles[variant] ?? variantStyles.primary
  const sizeClass    = sizeStyles[size]        ?? sizeStyles.medium
  const alignClass   = alignStyles[alignment]  ?? alignStyles.left

  const anchorTarget = target === 'blank' ? '_blank' : '_self'
  const rel          = target === 'blank' ? 'noopener noreferrer' : undefined

  const className = `inline-block no-underline font-semibold border transition-colors ${variantClass} ${sizeClass}`

  const isInternal = url.startsWith('/')

  return (
    <div className={`my-4 ${alignClass}`}>
      {isInternal ? (
        <Link
          href={url}
          className={className}
          {...(target === 'blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </Link>
      ) : (
        <a
          href={url}
          target={anchorTarget}
          rel={rel}
          className={className}
        >
          {label}
        </a>
      )}
    </div>
  )
}
