import React from 'react'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { parseMarkdown } from '@git-cms/core/markdown'
import type { BlockInstance } from '@git-cms/core'
import { HeroBlock, BannerBlock, USPBlock, ImageBlock, TextBlock, LayoutBlock, HeadingBlock, ButtonBlock } from '../../components/blocks'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

const slugMap: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'content', 'slug-map.json'), 'utf-8')
)

function readContent(slug: string[]) {
  const slugStr = slug.length === 0 ? '/' : '/' + slug.join('/')
  const relPath = slugMap[slugStr]
  if (!relPath) return null
  try {
    return parseMarkdown(fs.readFileSync(path.join(process.cwd(), relPath), 'utf-8'))
  } catch {
    return null
  }
}

function renderBlock(block: BlockInstance): React.ReactNode {
  switch (block.type) {
    case 'hero':
      return <HeroBlock key={block.id} block={block} />
    case 'banner':
      return <BannerBlock key={block.id} block={block} />
    case 'usp':
      return <USPBlock key={block.id} block={block} />
    case 'image':
      return <ImageBlock key={block.id} block={block} />
    case 'text':
      return <TextBlock key={block.id} block={block} />
    case 'layout':
      return <LayoutBlock key={block.id} block={block} renderBlock={renderBlock} />
    case 'heading':
      return <HeadingBlock key={block.id} block={block} />
    case 'button':
      return <ButtonBlock key={block.id} block={block} />
    default:
      return null
  }
}

export default async function Page({ params }: PageProps) {
  const { slug = [] } = await params
  const content = readContent(slug)

  if (!content) notFound()

  return (
    <main>
      {content.blocks.length > 0 ? (
        // content.blocks.map(renderBlock)
        content.blocks.map((block) => {
          if (block.type !== 'hero') {
            return (
              <div key={`${block.type}-${block.id}`} className="container mx-auto px-4 mb-8">
                {renderBlock(block)}
              </div>
            )
          }

          return renderBlock(block)
        })
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold">{content.title}</h1>
          {content.description && (
            <p className="mt-4 text-xl text-neutral-600">{content.description}</p>
          )}
        </div>
      )}
    </main>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug = [] } = await params
  const content = readContent(slug)
  if (!content) return {}
  return {
    title: content.title,
    description: content.description,
  }
}
