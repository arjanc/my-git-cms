import React from 'react'
import type { BlockInstance } from '@git-cms/core'

const variantStyles: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  success: 'bg-green-50 border-green-200 text-green-900',
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
