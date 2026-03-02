'use client'

// Classic JSX transform is active ("jsx": "react") so React must be imported.
import React, { Suspense } from 'react'

// React.lazy defers the Tiptap/ProseMirror import until first client render,
// preventing window/document access during SSR in Next.js App Router.
// This file must not import from 'next/*' — the package is framework-agnostic.
const TiptapEditor = React.lazy(() =>
  import('./TiptapEditor').then((mod) => ({ default: mod.TiptapEditor }))
)

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <Suspense fallback={<div className="w-full h-48 border rounded bg-gray-50 animate-pulse" />}>
      <TiptapEditor value={value} onChange={onChange} />
    </Suspense>
  )
}
