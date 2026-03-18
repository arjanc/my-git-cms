'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface FileListProps {
  onSelectFile: (file: string) => void
  onCreateNew: () => void
  onBack: () => void
  contentPath: string
  apiBasePath?: string
}

interface FileEntry {
  name: string
  path: string
  type: string
  sha: string
}

interface PageDetail extends FileEntry {
  pageTitle: string
  navOrder: number
  navParent: string | null
  slug: string | null
  children: PageDetail[]
}

async function loadPageDetail(file: FileEntry, apiBasePath: string): Promise<PageDetail> {
  try {
    const res = await fetch(`${apiBasePath}/${file.path}`)
    const data = await res.json()
    const pc = data.pageContent
    return {
      ...file,
      pageTitle: pc?.title ?? file.name.replace(/\.md$/, ''),
      navOrder: typeof pc?.navOrder === 'number' ? pc.navOrder : Infinity,
      navParent: pc?.navParent ?? null,
      slug: pc?.slug ?? null,
      children: [],
    }
  } catch {
    return {
      ...file,
      pageTitle: file.name.replace(/\.md$/, ''),
      navOrder: Infinity,
      navParent: null,
      slug: null,
      children: [],
    }
  }
}

function buildTree(pages: PageDetail[]): PageDetail[] {
  const sorted = [...pages].sort((a, b) => {
    if (a.navOrder !== b.navOrder) return a.navOrder - b.navOrder
    return a.pageTitle.localeCompare(b.pageTitle)
  })

  const bySlug = new Map<string, PageDetail>()
  for (const page of sorted) {
    if (page.slug) bySlug.set(page.slug, page)
  }

  const roots: PageDetail[] = []
  for (const page of sorted) {
    if (page.navParent) {
      const parent = bySlug.get(page.navParent)
      if (parent) {
        parent.children.push(page)
        continue
      }
    }
    roots.push(page)
  }

  return roots
}

interface TreeNodeProps {
  page: PageDetail
  depth: number
  onSelectFile: (path: string) => void
}

function TreeNode({ page, depth, onSelectFile }: TreeNodeProps) {
  const hasChildren = page.children.length > 0
  const isChild = depth > 0

  return (
    <div>
      <button
        onClick={() => onSelectFile(page.path)}
        className="w-full text-left group"
      >
        <Card
          className={`px-4 py-3 hover:shadow-md transition-shadow cursor-pointer ${isChild ? 'bg-neutral-50 border-neutral-200' : ''
            }`}
        >
          <div className="flex items-center gap-2">
            {isChild && (
              <span className="text-neutral-400 text-xs select-none flex-shrink-0">└</span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium truncate group-hover:text-blue-600 transition-colors ${isChild ? 'text-sm text-gray-700' : 'text-gray-800'
                    }`}
                >
                  {page.pageTitle}
                </span>
                {hasChildren && (
                  <span className="flex-shrink-0 text-xs text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5 leading-none">
                    {page.children.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">{page.name}</span>
            </div>
          </div>
        </Card>
      </button>

      {hasChildren && (
        <div className="mt-2 space-y-2 ml-5 pl-3 border-l-2 border-neutral-200">
          {page.children.map((child) => (
            <TreeNode
              key={child.path}
              page={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileList({
  onSelectFile,
  onCreateNew,
  onBack,
  contentPath,
  apiBasePath = '/admin/api/cms',
}: FileListProps) {
  const [tree, setTree] = useState<PageDetail[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBasePath}/${contentPath}`)
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to load files')
        return
      }
      const allFiles: FileEntry[] = Array.isArray(data) ? data : []
      const mdFiles = allFiles.filter((f) => f.type === 'file' && f.name.endsWith('.md'))

      if (mdFiles.length === 0) {
        setTree([])
        return
      }

      // Fetch each file's page content in parallel to get title + nav fields
      const details = await Promise.all(
        mdFiles.map((f) => loadPageDetail(f, apiBasePath))
      )

      const hasNavData = details.some((d) => d.navParent !== null)
      if (hasNavData) {
        setTree(buildTree(details))
      } else {
        // No parent-child data — show sorted flat list
        setTree(
          [...details].sort((a, b) => {
            if (a.navOrder !== b.navOrder) return a.navOrder - b.navOrder
            return a.pageTitle.localeCompare(b.pageTitle)
          })
        )
      }
    } catch {
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const label = contentPath.split('/').pop() ?? 'Pages'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{label}</h2>
          <p className="mt-0.5 text-sm text-gray-500 font-mono">{contentPath}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <Button size="sm" onClick={onCreateNew}>
            + New
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-5 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {error === 'Unauthorized'
              ? 'Not signed in. Please sign in with GitHub to manage content.'
              : error}
          </p>
        </Card>
      ) : (tree ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No files found.</p>
          <Button onClick={onCreateNew}>Create your first file</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(tree ?? []).map((page) => (
            <TreeNode
              key={page.path}
              page={page}
              depth={0}
              onSelectFile={onSelectFile}
            />
          ))}
          <button
            onClick={onCreateNew}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            + New file
          </button>
        </div>
      )}
    </div>
  )
}
