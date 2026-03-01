'use client';
import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { FileList } from './FileList';
import { MediaManager } from './MediaManager';
export function CMS({ basePath = '/admin', apiBasePath = '/admin/api/cms', contentPath = 'content/pages', githubOwner, githubRepo, blockSchemas, pageSchemas, user, signOutUrl, }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeContentPath, setActiveContentPath] = useState(contentPath);
    const [isCreating, setIsCreating] = useState(false);
    function handleSelectSchema(schemaType) {
        const schema = pageSchemas?.find((s) => s.type === schemaType);
        if (schema)
            setActiveContentPath(schema.contentPath);
        setCurrentView('files');
    }
    function handleCreateNew() {
        setSelectedFile(null);
        setIsCreating(true);
        setCurrentView('editor');
    }
    return (React.createElement("div", { className: "git-cms-container min-h-screen bg-gray-50" },
        React.createElement("header", { className: "bg-white border-b" },
            React.createElement("div", { className: "container mx-auto px-4 py-4 flex items-center justify-between" },
                React.createElement("h1", { className: "text-2xl font-bold" }, "Git CMS"),
                React.createElement("div", { className: "flex items-center gap-6" },
                    React.createElement("nav", { className: "flex items-center gap-4" },
                        React.createElement("button", { onClick: () => setCurrentView('dashboard'), className: `text-sm font-medium ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}` }, "Dashboard"),
                        React.createElement("button", { onClick: () => setCurrentView('media'), className: `text-sm font-medium ${currentView === 'media' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}` }, "Media Library")),
                    React.createElement("div", { className: "flex items-center gap-3 border-l pl-6" },
                        user?.image && (React.createElement("img", { src: user.image, alt: "", width: 32, height: 32, className: "rounded-full" })),
                        user?.name && (React.createElement("span", { className: "text-sm text-gray-700" }, user.name)),
                        signOutUrl && (React.createElement("a", { href: signOutUrl, className: "text-sm text-gray-500 hover:text-gray-800 underline" }, "Sign out")))))),
        React.createElement("main", { className: "container mx-auto px-4 py-8" },
            currentView === 'dashboard' && (React.createElement(Dashboard, { onNavigate: setCurrentView, basePath: basePath, pageSchemas: pageSchemas, onSelectSchema: handleSelectSchema })),
            currentView === 'files' && (React.createElement(FileList, { onSelectFile: (file) => {
                    setSelectedFile(file);
                    setIsCreating(false);
                    setCurrentView('editor');
                }, onCreateNew: handleCreateNew, onBack: () => setCurrentView('dashboard'), contentPath: activeContentPath, apiBasePath: apiBasePath })),
            currentView === 'editor' && (React.createElement(Editor, { filePath: selectedFile, isCreating: isCreating, contentPath: activeContentPath, onBack: () => {
                    setIsCreating(false);
                    setCurrentView('files');
                }, onCreated: (newFilePath) => {
                    setSelectedFile(newFilePath);
                    setIsCreating(false);
                }, basePath: basePath, apiBasePath: apiBasePath, blockSchemas: blockSchemas, pageSchemas: pageSchemas })),
            currentView === 'media' && (React.createElement(MediaManager, { apiBasePath: apiBasePath, isLibraryView: true })))));
}
