'use client';
import React, { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { FileList } from './FileList';
import { MediaManager } from './MediaManager';
function CMSInner({ basePath = '/admin', apiBasePath = '/admin/api/cms', contentPath = 'content/pages', githubOwner, githubRepo, blockSchemas, pageSchemas, user, signOutUrl, }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Parse path relative to basePath
    const relative = (pathname === basePath || pathname.startsWith(basePath + '/'))
        ? pathname.slice(basePath.length)
        : '';
    const segments = relative.split('/').filter(Boolean);
    const section = segments[0]; // 'media' | 'files' | schema type | undefined
    const action = segments[1]; // 'create' | 'edit' | undefined
    const fileParam = searchParams.get('file'); // decoded file path (editor only)
    const isMediaView = section === 'media';
    const isFilesView = !isMediaView && !!section && action === undefined;
    const isEditorView = !isMediaView && !!section && (action === 'create' || action === 'edit');
    const isCreating = action === 'create';
    const activeSchema = (!isMediaView && section && section !== 'files')
        ? pageSchemas?.find(s => s.type === section)
        : undefined;
    const activeContentPath = activeSchema?.contentPath ?? contentPath;
    const currentView = isMediaView ? 'media' :
        isEditorView ? 'editor' :
            isFilesView ? 'files' :
                'dashboard';
    // Navigation helpers
    function toDashboard() { router.push(basePath); }
    function toMedia() { router.push(`${basePath}/media`); }
    function toFiles(schemaType) {
        router.push(`${basePath}/${schemaType ?? 'files'}`);
    }
    function toCreate() {
        router.push(`${basePath}/${section ?? 'files'}/create`);
    }
    function toEditor(file) {
        router.push(`${basePath}/${section ?? 'files'}/edit?file=${encodeURIComponent(file)}`);
    }
    function handleEditorBack() {
        section ? router.push(`${basePath}/${section}`) : toDashboard();
    }
    function handleCreated(newPath) {
        router.replace(`${basePath}/${section ?? 'files'}/edit?file=${encodeURIComponent(newPath)}`);
    }
    return (React.createElement("div", { className: "git-cms-container min-h-screen bg-gray-50" },
        React.createElement("header", { className: "bg-white border-b" },
            React.createElement("div", { className: "container mx-auto px-4 py-4 flex items-center justify-between" },
                React.createElement("h1", { className: "text-2xl font-bold" }, "Git CMS"),
                React.createElement("div", { className: "flex items-center gap-6" },
                    React.createElement("nav", { className: "flex items-center gap-4" },
                        React.createElement("button", { onClick: toDashboard, className: `text-sm font-medium ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}` }, "Dashboard"),
                        React.createElement("button", { onClick: toMedia, className: `text-sm font-medium ${currentView === 'media' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}` }, "Media Library")),
                    React.createElement("div", { className: "flex items-center gap-3 border-l pl-6" },
                        user?.image && (React.createElement("img", { src: user.image, alt: "", width: 32, height: 32, className: "rounded-full" })),
                        user?.name && (React.createElement("span", { className: "text-sm text-gray-700" }, user.name)),
                        signOutUrl && (React.createElement("a", { href: signOutUrl, className: "text-sm text-gray-500 hover:text-gray-800 underline" }, "Sign out")))))),
        React.createElement("main", { className: "container mx-auto px-4 py-8" },
            currentView === 'dashboard' && (React.createElement(Dashboard, { onNavigate: () => toFiles(), basePath: basePath, pageSchemas: pageSchemas, onSelectSchema: toFiles })),
            currentView === 'files' && (React.createElement(FileList, { onSelectFile: toEditor, onCreateNew: toCreate, onBack: toDashboard, contentPath: activeContentPath, apiBasePath: apiBasePath })),
            currentView === 'editor' && (React.createElement(Editor, { filePath: fileParam, isCreating: isCreating, contentPath: activeContentPath, onBack: handleEditorBack, onCreated: handleCreated, basePath: basePath, apiBasePath: apiBasePath, blockSchemas: blockSchemas, pageSchemas: pageSchemas })),
            currentView === 'media' && (React.createElement(MediaManager, { apiBasePath: apiBasePath, isLibraryView: true })))));
}
export function CMS(props) {
    return (React.createElement(Suspense, null,
        React.createElement(CMSInner, { ...props })));
}
