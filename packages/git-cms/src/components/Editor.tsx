'use client'

import React, { useState, useEffect } from 'react'
import type { BlockSchema, BlockInstance, PageContent, PageSchema } from '../types/schemas'
import { BlockEditor } from './BlockEditor'

// Inlined so this client component has zero server-only dependencies (no gray-matter)
function generateBlockId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface EditorProps {
  filePath: string | null
  /** When true, the editor is in create-new-file mode (no existing file to load) */
  isCreating?: boolean
  /** Directory path where the new file will be created, e.g. 'example-app/content/pages' */
  contentPath?: string
  onBack: () => void
  /** Called after a new file is successfully committed, with its full repo path */
  onCreated?: (filePath: string) => void
  basePath: string
  apiBasePath?: string
  blockSchemas?: BlockSchema[]
  pageSchemas?: PageSchema[]
}

export function Editor({
  filePath,
  isCreating = false,
  contentPath,
  onBack,
  onCreated,
  apiBasePath = '/admin/api/cms',
  blockSchemas,
  pageSchemas,
}: EditorProps) {
  const [rawContent, setRawContent] = useState('')
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fileSha, setFileSha] = useState<string | undefined>(undefined)
  const [newFileName, setNewFileName] = useState('')
  const schema = pageSchemas?.find((s) => s.contentPath.includes(contentPath || ''));

  useEffect(() => {
    if (filePath) {
      loadFile(filePath)
    } else if (isCreating) {
      // New file — initialise empty state, skip loading
      setRawContent('')
      setPageContent(
        blockSchemas && blockSchemas.length > 0
          ? { title: '', slug: '', description: '', blocks: [], pageSchema: schema?.type }
          : null
      )
      setFileSha(undefined)
      setNewFileName('')
      setLoading(false)
    }
  }, [filePath, isCreating])

  async function loadFile(path: string) {
    setLoading(true)
    try {
      const response = await fetch(`${apiBasePath}/${path}`)
      const data = await response.json()
      const raw: string = data.content ?? ''
      setRawContent(raw)
      setFileSha(data.sha)
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
    let targetPath = filePath

    if (isCreating) {
      const name = newFileName.trim()
      if (!name) {
        alert('Please enter a file name.')
        return
      }
      const safeName = name.endsWith('.md') ? name : `${name}.md`
      targetPath = contentPath ? `${contentPath}/${safeName}` : safeName
    }

    if (!targetPath) return

    setSaving(true)
    try {
      const isNew = isCreating
      const message = isNew ? `Create ${targetPath}` : `Update ${targetPath}`

      const body =
        blockSchemas && blockSchemas.length > 0 && pageContent
          ? { path: targetPath, pageContent, message, ...(isNew ? {} : { sha: fileSha }) }
          : { path: targetPath, content: rawContent, message, ...(isNew ? {} : { sha: fileSha }) }

      const response = await fetch(`${apiBasePath}/${targetPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(`Failed to save: ${data.error ?? 'Unknown error'}`)
        return
      }

      if (isNew && onCreated) {
        onCreated(targetPath)
      } else {
        alert('Saved successfully!')
      }
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
        {isCreating ? (
          <div className="flex items-center gap-2 flex-1 mr-4">
            <span className="text-sm text-gray-500 whitespace-nowrap">New file:</span>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="my-page.md"
              className="border rounded px-3 py-1.5 text-sm flex-1 max-w-xs"
              autoFocus
            />
          </div>
        ) : (
          <h2 className="text-xl font-bold truncate max-w-sm text-gray-800">{filePath}</h2>
        )}
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (isCreating && !newFileName.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isCreating ? 'Create' : 'Save'}
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
