'use client'

import React, { useState, useEffect } from 'react'
import { Dashboard } from './Dashboard'
import { Editor } from './Editor'
import { FileList } from './FileList'

export interface CMSProps {
  basePath?: string
  contentPath?: string
  githubOwner?: string
  githubRepo?: string
}

export function CMS({ 
  basePath = '/admin',
  contentPath = 'content/pages',
  githubOwner,
  githubRepo
}: CMSProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'files'>('dashboard')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

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
          />
        )}

        {currentView === 'files' && (
          <FileList
            onSelectFile={(file) => {
              setSelectedFile(file)
              setCurrentView('editor')
            }}
            onBack={() => setCurrentView('dashboard')}
            contentPath={contentPath}
          />
        )}

        {currentView === 'editor' && (
          <Editor
            filePath={selectedFile}
            onBack={() => setCurrentView('files')}
            basePath={basePath}
          />
        )}
      </main>
    </div>
  )
}
