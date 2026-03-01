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
  user?: { name?: string | null; image?: string | null }
  signOutUrl?: string
}

export function CMS({
  basePath = '/admin',
  apiBasePath = '/admin/api/cms',
  contentPath = 'content/pages',
  githubOwner,
  githubRepo,
  blockSchemas,
  pageSchemas,
  user,
  signOutUrl,
}: CMSProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'files'>('dashboard')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [activeContentPath, setActiveContentPath] = useState(contentPath)
  const [isCreating, setIsCreating] = useState(false)

  function handleSelectSchema(schemaType: string) {
    const schema = pageSchemas?.find((s) => s.type === schemaType)
    if (schema) setActiveContentPath(schema.contentPath)
    setCurrentView('files')
  }

  function handleCreateNew() {
    setSelectedFile(null)
    setIsCreating(true)
    setCurrentView('editor')
  }

  return (
    <div className="git-cms-container min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Git CMS</h1>
          <div className="flex items-center gap-3">
            {user?.image && (
              <img src={user.image} alt="" width={32} height={32} className="rounded-full" />
            )}
            {user?.name && (
              <span className="text-sm text-gray-700">{user.name}</span>
            )}
            {signOutUrl && (
              <a
                href={signOutUrl}
                className="text-sm text-gray-500 hover:text-gray-800 underline"
              >
                Sign out
              </a>
            )}
          </div>
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
              setIsCreating(false)
              setCurrentView('editor')
            }}
            onCreateNew={handleCreateNew}
            onBack={() => setCurrentView('dashboard')}
            contentPath={activeContentPath}
            apiBasePath={apiBasePath}
          />
        )}

        {currentView === 'editor' && (
          <Editor
            filePath={selectedFile}
            isCreating={isCreating}
            contentPath={activeContentPath}
            onBack={() => {
              setIsCreating(false)
              setCurrentView('files')
            }}
            onCreated={(newFilePath) => {
              setSelectedFile(newFilePath)
              setIsCreating(false)
            }}
            basePath={basePath}
            apiBasePath={apiBasePath}
            blockSchemas={blockSchemas}
            pageSchemas={pageSchemas}
          />
        )}

      </main>
    </div>
  )
}
