'use client'

import React, { useState, useEffect } from 'react'
import type { BlockSchema, BlockInstance, PageContent } from '../types/schemas'
import { BlockEditor } from './BlockEditor'

// Inlined so this client component has zero server-only dependencies (no gray-matter)
function generateBlockId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface EditorProps {
  filePath: string | null
  onBack: () => void
  basePath: string
  apiBasePath?: string
  blockSchemas?: BlockSchema[]
}

export function Editor({
  filePath,
  onBack,
  apiBasePath = '/admin/api/cms',
  blockSchemas,
}: EditorProps) {
  const [rawContent, setRawContent] = useState('')
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (filePath) loadFile(filePath)
  }, [filePath])

  async function loadFile(path: string) {
    setLoading(true)
    try {
      const response = await fetch(`${apiBasePath}/${path}`)
      const data = await response.json()
      const raw: string = data.content ?? ''
      setRawContent(raw)
      // pageContent is parsed server-side by the API handler (gray-matter stays server-side)
      if (blockSchemas && blockSchemas.length > 0 && data.pageContent) {
        setPageContent(data.pageContent as PageContent)
      }
    } catch (err) {
      console.error('Error loading file:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!filePath) return
    setSaving(true)
    try {
      // Send pageContent as JSON → API serializes to markdown server-side
      const body =
        blockSchemas && blockSchemas.length > 0 && pageContent
          ? { path: filePath, pageContent, message: `Update ${filePath}` }
          : { path: filePath, content: rawContent, message: `Update ${filePath}` }

      await fetch(`${apiBasePath}/${filePath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      alert('Saved successfully!')
    } catch (err) {
      console.error('Error saving:', err)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function handleAddBlock(type: string) {
    if (!pageContent) return
    const schema = blockSchemas?.find((s) => s.type === type)
    if (!schema) return
    const newBlock: BlockInstance = { id: generateBlockId(), type }
    for (const field of schema.fields) {
      if (field.defaultValue !== undefined) newBlock[field.name] = field.defaultValue
    }
    setPageContent({ ...pageContent, blocks: [...pageContent.blocks, newBlock] })
  }

  function handleBlockChange(index: number, updated: BlockInstance) {
    if (!pageContent) return
    const blocks = [...pageContent.blocks]
    blocks[index] = updated
    setPageContent({ ...pageContent, blocks })
  }

  function handleBlockRemove(index: number) {
    if (!pageContent) return
    setPageContent({ ...pageContent, blocks: pageContent.blocks.filter((_, i) => i !== index) })
  }

  function handleMoveUp(index: number) {
    if (!pageContent || index === 0) return
    const blocks = [...pageContent.blocks]
    ;[blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]
    setPageContent({ ...pageContent, blocks })
  }

  function handleMoveDown(index: number) {
    if (!pageContent || index === pageContent.blocks.length - 1) return
    const blocks = [...pageContent.blocks]
    ;[blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]
    setPageContent({ ...pageContent, blocks })
  }

  if (loading) return <div>Loading editor...</div>

  const useSchemaEditor = !!(blockSchemas && blockSchemas.length > 0 && pageContent)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold truncate max-w-sm text-gray-800">{filePath}</h2>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {useSchemaEditor ? (
        <div className="space-y-4">
          {/* Page metadata */}
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Page settings</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={pageContent!.title}
                onChange={(e) => setPageContent({ ...pageContent!, title: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
              <input
                type="text"
                value={pageContent!.slug}
                onChange={(e) => setPageContent({ ...pageContent!, slug: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={pageContent!.description ?? ''}
                rows={2}
                onChange={(e) => setPageContent({ ...pageContent!, description: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Block list */}
          {pageContent!.blocks.map((block, index) => {
            const schema = blockSchemas!.find((s) => s.type === block.type)
            if (!schema) return null
            return (
              <BlockEditor
                key={block.id}
                block={block}
                schema={schema}
                onChange={(updated) => handleBlockChange(index, updated)}
                onRemove={() => handleBlockRemove(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            )
          })}

          {/* Add block picker */}
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-700 mb-2">Add block</p>
            <div className="flex flex-wrap gap-2">
              {blockSchemas!.map((schema) => (
                <button
                  key={schema.type}
                  onClick={() => handleAddBlock(schema.type)}
                  className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                >
                  + {schema.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="w-full h-96 p-4 border rounded font-mono text-sm"
            placeholder="Edit your content..."
          />
        </div>
      )}
    </div>
  )
}
