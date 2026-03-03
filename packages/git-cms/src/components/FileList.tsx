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

export function FileList({
  onSelectFile,
  onCreateNew,
  onBack,
  contentPath,
  apiBasePath = '/admin/api/cms',
}: FileListProps) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch(`${apiBasePath}/${contentPath}`)
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to load files')
        setFiles([])
        return
      }
      setFiles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading files:', error)
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {contentPath.split('/').pop() ?? 'Pages'}
          </h2>
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
      ) : files.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No files found.</p>
          <Button onClick={onCreateNew}>Create your first file</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className="w-full text-left group"
            >
              <Card className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
                <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {file.name}
                </span>
              </Card>
            </button>
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
