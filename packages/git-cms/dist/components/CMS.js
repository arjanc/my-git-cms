'use client';
import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { FileList } from './FileList';
export function CMS({ basePath = '/admin', contentPath = 'content/pages', githubOwner, githubRepo }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedFile, setSelectedFile] = useState(null);
    return (React.createElement("div", { className: "git-cms-container min-h-screen bg-gray-50" },
        React.createElement("header", { className: "bg-white border-b" },
            React.createElement("div", { className: "container mx-auto px-4 py-4" },
                React.createElement("h1", { className: "text-2xl font-bold" }, "Git CMS"))),
        React.createElement("main", { className: "container mx-auto px-4 py-8" },
            currentView === 'dashboard' && (React.createElement(Dashboard, { onNavigate: setCurrentView, basePath: basePath })),
            currentView === 'files' && (React.createElement(FileList, { onSelectFile: (file) => {
                    setSelectedFile(file);
                    setCurrentView('editor');
                }, onBack: () => setCurrentView('dashboard'), contentPath: contentPath })),
            currentView === 'editor' && (React.createElement(Editor, { filePath: selectedFile, onBack: () => setCurrentView('files'), basePath: basePath })))));
}
