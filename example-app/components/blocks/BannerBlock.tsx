import React from 'react'
import type { BlockInstance } from '@git-cms/core'

const variantStyles: Record<string, string> = {
  info:    'bg-primary-50 border-primary-200 text-primary-900',
  warning: 'bg-warning-50 border-warning-200 text-warning-900',
  success: 'bg-success-50 border-success-200 text-success-900',
}

export function BannerBlock({ block }: { block: BlockInstance }) {
  const text = String(block.text ?? '')
  const variant = String(block.variant ?? 'info')
  const styles = variantStyles[variant] ?? variantStyles.info

  return (
    <div className={`border rounded-lg px-6 py-4 ${styles}`}>
      <p className="text-sm font-medium">{text}</p>
    </div>
  )
}
