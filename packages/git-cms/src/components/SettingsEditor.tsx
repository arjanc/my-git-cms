'use client'

import React, { useState, useEffect } from 'react'
import type { BlockSchema, BlockInstance, SiteSettings } from '../types/schemas'
import { BlockEditor } from './BlockEditor'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

function generateBlockId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface SettingsEditorProps {
  settingsPath: string
  apiBasePath?: string
  blockSchemas?: BlockSchema[]
  onBack: () => void
}

export function SettingsEditor({
  settingsPath,
  apiBasePath = '/admin/api/cms',
  blockSchemas,
  onBack,
}: SettingsEditorProps) {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [fileSha, setFileSha] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [settingsPath])

  async function loadSettings() {
    setLoading(true)
    try {
      const response = await fetch(`${apiBasePath}/${settingsPath}`)
      if (response.status === 404) {
        setSettings({})
        setFileSha(undefined)
        return
      }
      const data = await response.json()
      setFileSha(data.sha)
      if (data.content) {
        try {
          setSettings(JSON.parse(data.content) as SiteSettings)
        } catch {
          setSettings({})
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveStatus('idle')
    setSaveError(null)
    try {
      const content = JSON.stringify(settings, null, 2)
      const body: Record<string, unknown> = {
        path: settingsPath,
        content,
        message: 'Update settings',
      }
      if (fileSha) body.sha = fileSha

      const response = await fetch(`${apiBasePath}/${settingsPath}`, {
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

      const data = await response.json()
      if (data.sha) setFileSha(data.sha)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setSaveError('Failed to save')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function handleAddBlock(type: string) {
    const schema = blockSchemas?.find((s) => s.type === type)
    if (!schema) return
    const newBlock: BlockInstance = { id: generateBlockId(), type }
    for (const field of schema.fields) {
      if (field.defaultValue !== undefined) newBlock[field.name] = field.defaultValue
    }
    setSettings((prev) => ({
      ...prev,
      footerBlocks: [...(prev.footerBlocks ?? []), newBlock],
    }))
  }

  function handleBlockChange(index: number, updated: BlockInstance) {
    const blocks = [...(settings.footerBlocks ?? [])]
    blocks[index] = updated
    setSettings((prev) => ({ ...prev, footerBlocks: blocks }))
  }

  function handleBlockRemove(index: number) {
    setSettings((prev) => ({
      ...prev,
      footerBlocks: (prev.footerBlocks ?? []).filter((_, i) => i !== index),
    }))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const blocks = [...(settings.footerBlocks ?? [])]
    ;[blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]
    setSettings((prev) => ({ ...prev, footerBlocks: blocks }))
  }

  function handleMoveDown(index: number) {
    const blocks = settings.footerBlocks ?? []
    if (index === blocks.length - 1) return
    const updated = [...blocks]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setSettings((prev) => ({ ...prev, footerBlocks: updated }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">General Settings</h2>
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
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="siteName">Site name</Label>
              <Input
                id="siteName"
                value={settings.siteName ?? ''}
                onChange={(e) => set('siteName', e.target.value)}
                placeholder="My Site"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={settings.author ?? ''}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="siteDescription">Site description</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription ?? ''}
              onChange={(e) => set('siteDescription', e.target.value)}
              placeholder="A short description of your site"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={settings.language ?? ''}
                onChange={(e) => set('language', e.target.value)}
                placeholder="en"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="themeColor">Theme color</Label>
              <Input
                id="themeColor"
                value={settings.themeColor ?? ''}
                onChange={(e) => set('themeColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="faviconUrl">Favicon URL</Label>
            <Input
              id="faviconUrl"
              value={settings.faviconUrl ?? ''}
              onChange={(e) => set('faviconUrl', e.target.value)}
              placeholder="/favicon.ico"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="canonicalBase">Canonical base URL</Label>
            <Input
              id="canonicalBase"
              value={settings.canonicalBase ?? ''}
              onChange={(e) => set('canonicalBase', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="robotsDirectives">Robots directives</Label>
              <Input
                id="robotsDirectives"
                value={settings.robotsDirectives ?? ''}
                onChange={(e) => set('robotsDirectives', e.target.value)}
                placeholder="index, follow"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ogImageUrl">Default OG image URL</Label>
              <Input
                id="ogImageUrl"
                value={settings.ogImageUrl ?? ''}
                onChange={(e) => set('ogImageUrl', e.target.value)}
                placeholder="/og-image.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer blocks */}
      {blockSchemas && blockSchemas.length > 0 && (
        <>
          {(settings.footerBlocks ?? []).map((block, index) => {
            const schema = blockSchemas.find((s) => s.type === block.type)
            if (!schema) return null
            return (
              <BlockEditor
                key={block.id}
                block={block}
                schema={schema}
                blockSchemas={blockSchemas}
                onChange={(updated) => handleBlockChange(index, updated)}
                onRemove={() => handleBlockRemove(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                apiBasePath={apiBasePath}
              />
            )
          })}

          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Add footer block</p>
              <div className="flex flex-wrap gap-2">
                {blockSchemas.map((schema) => (
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
        </>
      )}
    </div>
  )
}
