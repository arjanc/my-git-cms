'use client';
import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { FileList } from './FileList';
export function CMS({ basePath = '/admin', apiBasePath = '/admin/api/cms', contentPath = 'content/pages', githubOwner, githubRepo, blockSchemas, pageSchemas, user, signOutUrl, }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeContentPath, setActiveContentPath] = useState(contentPath);
    function handleSelectSchema(schemaType) {
        const schema = pageSchemas?.find((s) => s.type === schemaType);
        if (schema)
            setActiveContentPath(schema.contentPath);
        setCurrentView('files');
    }
    return (React.createElement("div", { className: "git-cms-container min-h-screen bg-gray-50" },
        React.createElement("header", { className: "bg-white border-b" },
            React.createElement("div", { className: "container mx-auto px-4 py-4 flex items-center justify-between" },
                React.createElement("h1", { className: "text-2xl font-bold" }, "Git CMS"),
                React.createElement("div", { className: "flex items-center gap-3" },
                    user?.image && (React.createElement("img", { src: user.image, alt: "", width: 32, height: 32, className: "rounded-full" })),
                    user?.name && (React.createElement("span", { className: "text-sm text-gray-700" }, user.name)),
                    signOutUrl && (React.createElement("a", { href: signOutUrl, className: "text-sm text-gray-500 hover:text-gray-800 underline" }, "Sign out"))))),
        React.createElement("main", { className: "container mx-auto px-4 py-8" },
            currentView === 'dashboard' && (React.createElement(Dashboard, { onNavigate: setCurrentView, basePath: basePath, pageSchemas: pageSchemas, onSelectSchema: handleSelectSchema })),
            currentView === 'files' && (React.createElement(FileList, { onSelectFile: (file) => {
                    setSelectedFile(file);
                    setCurrentView('editor');
                }, onBack: () => setCurrentView('dashboard'), contentPath: activeContentPath, apiBasePath: apiBasePath })),
            currentView === 'editor' && (React.createElement(Editor, { filePath: selectedFile, onBack: () => setCurrentView('files'), basePath: basePath, apiBasePath: apiBasePath, blockSchemas: blockSchemas })))));
}
