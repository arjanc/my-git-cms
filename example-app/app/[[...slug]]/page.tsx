import React from 'react'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { parseMarkdown } from '@git-cms/core/markdown'
import type { BlockInstance } from '@git-cms/core'
import { HeroBlock, BannerBlock, USPBlock, ImageBlock, TextBlock } from '../../components/blocks'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

function resolveContentPath(slug: string[]): string[] {
  if (slug.length === 0) {
    return [path.join(process.cwd(), 'content', 'pages', 'home.md')]
  }
  return [
    path.join(process.cwd(), 'content', ...slug) + '.md',
    path.join(process.cwd(), 'content', ...slug, 'index.md'),
  ]
}

function readContent(slug: string[]) {
  const candidates = resolveContentPath(slug)
  for (const filePath of candidates) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return parseMarkdown(raw)
    } catch {
      // try next candidate
    }
  }
  return null
}

function renderBlock(block: BlockInstance) {
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
        content.blocks.map(renderBlock)
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold">{content.title}</h1>
          {content.description && (
            <p className="mt-4 text-xl text-gray-600">{content.description}</p>
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
