'use client'

import React, { useState, useEffect } from 'react'
import type { BlockSchema, BlockInstance, PageContent, PageSchema } from '../types/schemas'
import { BlockEditor } from './BlockEditor'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fileSha, setFileSha] = useState<string | undefined>(undefined)
  const [newFileName, setNewFileName] = useState('')
  const schema = pageSchemas?.find((s) => s.contentPath.includes(contentPath || ''))

  useEffect(() => {
    if (filePath) {
      loadFile(filePath)
    } else if (isCreating) {
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
        setSaveError('Please enter a file name.')
        setSaveStatus('error')
        return
      }
      const safeName = name.endsWith('.md') ? name : `${name}.md`
      targetPath = contentPath ? `${contentPath}/${safeName}` : safeName
    }

    if (!targetPath) return

    setSaving(true)
    setSaveStatus('idle')
    setSaveError(null)
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
        setSaveError(data.error ?? 'Unknown error')
        setSaveStatus('error')
        return
      }

      if (isNew && onCreated) {
        onCreated(targetPath)
      } else {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (err) {
      console.error('Error saving:', err)
      setSaveError('Failed to save')
      setSaveStatus('error')
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  const useSchemaEditor = !!(blockSchemas && blockSchemas.length > 0 && pageContent)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {isCreating ? (
          <div className="flex items-center gap-2 flex-1">
            <Label htmlFor="new-file-name" className="whitespace-nowrap text-gray-500">
              New file:
            </Label>
            <Input
              id="new-file-name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="my-page.md"
              className="max-w-xs"
              autoFocus
            />
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">{filePath}</h2>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 font-medium">Saved ✓</span>
          )}
          {saveStatus === 'error' && saveError && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || (isCreating && !newFileName.trim())}
          >
            {saving ? 'Saving…' : isCreating ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>

      {useSchemaEditor ? (
        <div className="space-y-4">
          {/* Page metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Page settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="page-title">Title</Label>
                <Input
                  id="page-title"
                  value={pageContent!.title}
                  onChange={(e) => setPageContent({ ...pageContent!, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="page-slug">Slug</Label>
                <Input
                  id="page-slug"
                  value={pageContent!.slug}
                  onChange={(e) => setPageContent({ ...pageContent!, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="page-desc">Description</Label>
                <Textarea
                  id="page-desc"
                  value={pageContent!.description ?? ''}
                  rows={2}
                  onChange={(e) =>
                    setPageContent({ ...pageContent!, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="navEnabled"
                  checked={!!pageContent!.navEnabled}
                  onChange={(e) =>
                    setPageContent({
                      ...pageContent!,
                      navEnabled: e.target.checked || undefined,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="navEnabled" className="text-sm text-gray-700">
                  Show in navigation
                </label>
              </div>
              {pageContent!.navEnabled && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="navTitle">
                      Nav label{' '}
                      <span className="text-gray-400 font-normal">(defaults to title)</span>
                    </Label>
                    <Input
                      id="navTitle"
                      value={pageContent!.navTitle ?? ''}
                      onChange={(e) =>
                        setPageContent({
                          ...pageContent!,
                          navTitle: e.target.value || undefined,
                        })
                      }
                      placeholder={pageContent!.title || 'Page title'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="navOrder">
                        Order <span className="text-gray-400 font-normal">(ascending)</span>
                      </Label>
                      <Input
                        id="navOrder"
                        type="number"
                        value={pageContent!.navOrder ?? ''}
                        onChange={(e) =>
                          setPageContent({
                            ...pageContent!,
                            navOrder: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="navParent">
                        Parent slug{' '}
                        <span className="text-gray-400 font-normal">(e.g. /about)</span>
                      </Label>
                      <Input
                        id="navParent"
                        value={pageContent!.navParent ?? ''}
                        onChange={(e) =>
                          setPageContent({
                            ...pageContent!,
                            navParent: e.target.value || undefined,
                          })
                        }
                        placeholder="/parent-page"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Add block</p>
              <div className="flex flex-wrap gap-2">
                {blockSchemas!.map((schema) => (
                  <Button
                    key={schema.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddBlock(schema.type)}
                  >
                    + {schema.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-5">
            <Textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="h-96 font-mono text-sm"
              placeholder="Edit your content..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
