import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { BlockInstance } from '@git-cms/core'

const ALLOWED_PROTOCOLS = /^(https?|mailto|tel):/i

function safeUrlTransform(url: string): string {
  return ALLOWED_PROTOCOLS.test(url) ? url : ''
}

export function TextBlock({ block }: { block: BlockInstance }) {
  const content = String(block.content ?? '')

  return (
    <div className="prose prose-gray max-w-none pb-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeUrlTransform}>{content}</ReactMarkdown>
    </div>
  )
}
