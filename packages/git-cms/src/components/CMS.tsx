'use client'

import React, { Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Dashboard } from './Dashboard'
import { Editor } from './Editor'
import { FileList } from './FileList'
import { MediaManager } from './MediaManager'
import type { BlockSchema, PageSchema } from '../types/schemas'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

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
    <div className="git-cms min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-base font-semibold text-gray-900 tracking-tight">Git CMS</span>
            <Separator orientation="vertical" className="h-5" />
            <nav className="flex items-center gap-1">
              <Button
                variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={toDashboard}
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === 'media' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={toMedia}
              >
                Media
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user?.image && (
              <img
                src={user.image}
                alt=""
                width={28}
                height={28}
                className="rounded-full ring-1 ring-gray-200"
              />
            )}
            {user?.name && (
              <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
            )}
            {signOutUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={signOutUrl}>Sign out</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-4 py-8">
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
