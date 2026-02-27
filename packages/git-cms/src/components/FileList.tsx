'use client'

import React, { useState, useEffect } from 'react'

interface FileListProps {
  onSelectFile: (file: string) => void
  onBack: () => void
  contentPath: string
}

export function FileList({ onSelectFile, onBack, contentPath }: FileListProps) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/cms/${contentPath}`)
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pages</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <p>Loading files...</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className="w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <span className="font-medium">{file.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
