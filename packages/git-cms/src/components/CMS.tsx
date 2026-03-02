'use client'

import React, { Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Dashboard } from './Dashboard'
import { Editor } from './Editor'
import { FileList } from './FileList'
import { MediaManager } from './MediaManager'
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

function CMSInner({
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse path relative to basePath
  const relative = (pathname === basePath || pathname.startsWith(basePath + '/'))
    ? pathname.slice(basePath.length)
    : ''
  const segments = relative.split('/').filter(Boolean)

  const section = segments[0]  // 'media' | 'files' | schema type | undefined
  const action  = segments[1]  // 'create' | 'edit' | undefined
  const fileParam = searchParams.get('file')  // decoded file path (editor only)

  const isMediaView  = section === 'media'
  const isFilesView  = !isMediaView && !!section && action === undefined
  const isEditorView = !isMediaView && !!section && (action === 'create' || action === 'edit')
  const isCreating   = action === 'create'

  const activeSchema = (!isMediaView && section && section !== 'files')
    ? pageSchemas?.find(s => s.type === section)
    : undefined
  const activeContentPath = activeSchema?.contentPath ?? contentPath

  const currentView: 'dashboard' | 'files' | 'editor' | 'media' =
    isMediaView  ? 'media'  :
    isEditorView ? 'editor' :
    isFilesView  ? 'files'  :
    'dashboard'

  // Navigation helpers
  function toDashboard() { router.push(basePath) }
  function toMedia()     { router.push(`${basePath}/media`) }

  function toFiles(schemaType?: string) {
    router.push(`${basePath}/${schemaType ?? 'files'}`)
  }
  function toCreate() {
    router.push(`${basePath}/${section ?? 'files'}/create`)
  }
  function toEditor(file: string) {
    router.push(`${basePath}/${section ?? 'files'}/edit?file=${encodeURIComponent(file)}`)
  }
  function handleEditorBack() {
    section ? router.push(`${basePath}/${section}`) : toDashboard()
  }
  function handleCreated(newPath: string) {
    router.replace(`${basePath}/${section ?? 'files'}/edit?file=${encodeURIComponent(newPath)}`)
  }

  return (
    <div className="git-cms-container min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Git CMS</h1>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <button
                onClick={toDashboard}
                className={`text-sm font-medium ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Dashboard
              </button>
              <button
                onClick={toMedia}
                className={`text-sm font-medium ${currentView === 'media' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Media Library
              </button>
            </nav>
            <div className="flex items-center gap-3 border-l pl-6">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={() => toFiles()}
            basePath={basePath}
            pageSchemas={pageSchemas}
            onSelectSchema={toFiles}
          />
        )}

        {currentView === 'files' && (
          <FileList
            onSelectFile={toEditor}
            onCreateNew={toCreate}
            onBack={toDashboard}
            contentPath={activeContentPath}
            apiBasePath={apiBasePath}
          />
        )}

        {currentView === 'editor' && (
          <Editor
            filePath={fileParam}
            isCreating={isCreating}
            contentPath={activeContentPath}
            onBack={handleEditorBack}
            onCreated={handleCreated}
            basePath={basePath}
            apiBasePath={apiBasePath}
            blockSchemas={blockSchemas}
            pageSchemas={pageSchemas}
          />
        )}

        {currentView === 'media' && (
          <MediaManager
            apiBasePath={apiBasePath}
            isLibraryView={true}
          />
        )}
      </main>
    </div>
  )
}

export function CMS(props: CMSProps) {
  return (
    <Suspense>
      <CMSInner {...props} />
    </Suspense>
  )
}
