'use client'

import React, { useState, useEffect } from 'react'

interface EditorProps {
  filePath: string | null
  onBack: () => void
  basePath: string
  apiBasePath?: string
}

export function Editor({ filePath, onBack, basePath, apiBasePath = '/admin/api/cms' }: EditorProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (filePath) {
      loadFile(filePath)
    }
  }, [filePath])

  const loadFile = async (path: string) => {
    try {
      const response = await fetch(`${apiBasePath}/${path}`)
      const data = await response.json()
      setContent(data.content)
    } catch (error) {
      console.error('Error loading file:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!filePath) return

    try {
      await fetch(`${apiBasePath}/${filePath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filePath,
          content,
          message: `Update ${filePath}`,
        }),
      })
      alert('Saved successfully!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save')
    }
  }

  if (loading) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Editor</h2>
        <div className="space-x-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 border rounded font-mono text-sm"
          placeholder="Edit your content..."
        />
      </div>
    </div>
  )
}
