import React from 'react'
import type { BlockInstance } from '@git-cms/core'

export function USPBlock({ block }: { block: BlockInstance }) {
  const title = String(block.title ?? '')
  const items = [
    { title: String(block.item1Title ?? ''), description: String(block.item1Description ?? '') },
    { title: String(block.item2Title ?? ''), description: String(block.item2Description ?? '') },
    { title: String(block.item3Title ?? ''), description: String(block.item3Description ?? '') },
  ].filter((item) => item.title)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
