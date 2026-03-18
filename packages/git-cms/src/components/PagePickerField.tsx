'use client'

import React, { useState } from 'react'
import type { FieldSchema } from '../types/schemas'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface Page {
  name: string
  path: string
  title: string
  slug: string
}

interface PagePickerFieldProps {
  /** Used when rendered from BlockEditor — provides label and contentPath */
  field?: FieldSchema
  /**
   * Explicit list of full content paths to fetch pages from.
   * Takes precedence over field.contentPath.
   * Use when you need pages from multiple directories (e.g. navParent picker).
   */
  contentPaths?: string[]
  value: string
  onChange: (val: string) => void
  apiBasePath: string
  /**
   * Slug of the currently edited page — excluded from the picker list.
   * Prevents a page from selecting itself as a parent or link target.
   */
  excludeSlug?: string
  placeholder?: string
}

async function fetchPagesFromPath(
  apiBasePath: string,
  contentPath: string
): Promise<Page[]> {
  const res = await fetch(`${apiBasePath}/${contentPath}`)
  if (!res.ok) return []
  const items = await res.json()
  if (!Array.isArray(items)) return []

  const mdFiles = items.filter(
    (item: { type: string; name: string }) =>
      item.type === 'file' && item.name.endsWith('.md')
  )

  return Promise.all(
    mdFiles.map(async (item: { name: string; path: string }) => {
      try {
        const fileRes = await fetch(`${apiBasePath}/${item.path}`)
        const fileData = await fileRes.json()
        const pc = fileData.pageContent
        return {
          name: item.name,
          path: item.path,
          title: pc?.title ?? item.name.replace(/\.md$/, ''),
          slug: pc?.slug ?? `/${item.name.replace(/\.md$/, '')}`,
        }
      } catch {
        return {
          name: item.name,
          path: item.path,
          title: item.name.replace(/\.md$/, ''),
          slug: `/${item.name.replace(/\.md$/, '')}`,
        }
      }
    })
  )
}

export function PagePickerField({
  field,
  contentPaths,
  value,
  onChange,
  apiBasePath,
  excludeSlug,
  placeholder,
}: PagePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolve which paths to fetch from
  const resolvedPaths: string[] =
    contentPaths && contentPaths.length > 0
      ? contentPaths
      : field?.contentPath
        ? [field.contentPath]
        : []

  const loadPages = async () => {
    if (resolvedPaths.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        resolvedPaths.map((p) => fetchPagesFromPath(apiBasePath, p))
      )
      const all = results.flat()

      // Deduplicate by slug, then exclude the current page if needed
      const seen = new Set<string>()
      const filtered: Page[] = []
      for (const page of all) {
        if (seen.has(page.slug)) continue
        seen.add(page.slug)
        if (excludeSlug && page.slug === excludeSlug) continue
        filtered.push(page)
      }

      // Sort alphabetically by title
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      setPages(filtered)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    loadPages()
  }

  const handleSelect = (slug: string) => {
    onChange(slug)
    setIsOpen(false)
  }

  const hasContent = resolvedPaths.length > 0

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? field?.label ?? 'Enter URL or select a page'}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        disabled={!hasContent}
        className="shrink-0"
      >
        Select page
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select a page</DialogTitle>
          </DialogHeader>

          {loading && (
            <p className="text-sm text-gray-500 py-4 text-center">Loading pages…</p>
          )}

          {error && (
            <p className="text-sm text-red-600 py-2">{error}</p>
          )}

          {!loading && !error && pages.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">No pages found</p>
          )}

          {!loading && pages.length > 0 && (
            <ul className="space-y-1 max-h-80 overflow-y-auto -mx-1">
              {pages.map((page) => {
                const isSelected = value === page.slug
                return (
                  <li key={page.path}>
                    <button
                      type="button"
                      onClick={() => handleSelect(page.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{page.title}</div>
                      <div className="text-xs text-gray-400 font-mono">{page.slug}</div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
