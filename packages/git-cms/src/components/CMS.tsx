'use client'

import React, { useState } from 'react'
import { Dashboard } from './Dashboard'
import { Editor } from './Editor'
import { FileList } from './FileList'
import type { BlockSchema, PageSchema } from '../types/schemas'

export interface CMSProps {
  basePath?: string
  apiBasePath?: string
  contentPath?: string
  githubOwner?: string
  githubRepo?: string
  blockSchemas?: BlockSchema[]
  pageSchemas?: PageSchema[]
}

export function CMS({
  basePath = '/admin',
  apiBasePath = '/admin/api/cms',
  contentPath = 'content/pages',
  githubOwner,
  githubRepo,
  blockSchemas,
  pageSchemas,
}: CMSProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'files'>('dashboard')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [activeContentPath, setActiveContentPath] = useState(contentPath)

  function handleSelectSchema(schemaType: string) {
    const schema = pageSchemas?.find((s) => s.type === schemaType)
    if (schema) setActiveContentPath(schema.contentPath)
    setCurrentView('files')
  }

  return (
    <div className="git-cms-container min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Git CMS</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={setCurrentView}
            basePath={basePath}
            pageSchemas={pageSchemas}
            onSelectSchema={handleSelectSchema}
          />
        )}

        {currentView === 'files' && (
          <FileList
            onSelectFile={(file) => {
              setSelectedFile(file)
              setCurrentView('editor')
            }}
            onBack={() => setCurrentView('dashboard')}
            contentPath={activeContentPath}
            apiBasePath={apiBasePath}
          />
        )}

        {currentView === 'editor' && (
          <Editor
            filePath={selectedFile}
            onBack={() => setCurrentView('files')}
            basePath={basePath}
            apiBasePath={apiBasePath}
            blockSchemas={blockSchemas}
          />
        )}
      </main>
    </div>
  )
}
