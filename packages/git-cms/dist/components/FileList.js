'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
export function FileList({ onSelectFile, onCreateNew, onBack, contentPath, apiBasePath = '/admin/api/cms', }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadFiles();
    }, []);
    const loadFiles = async () => {
        try {
            const response = await fetch(`${apiBasePath}/${contentPath}`);
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Failed to load files');
                setFiles([]);
                return;
            }
            setFiles(Array.isArray(data) ? data : []);
        }
        catch (error) {
            console.error('Error loading files:', error);
            setError('Failed to load files');
        }
        finally {
            setLoading(false);
        }
    };
    return (React.createElement("div", { className: "space-y-5" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, contentPath.split('/').pop() ?? 'Pages'),
                React.createElement("p", { className: "mt-0.5 text-sm text-gray-500 font-mono" }, contentPath)),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(Button, { variant: "ghost", size: "sm", onClick: onBack }, "\u2190 Back"),
                React.createElement(Button, { size: "sm", onClick: onCreateNew }, "+ New"))),
        loading ? (React.createElement("div", { className: "space-y-2" }, [1, 2, 3].map((n) => (React.createElement("div", { key: n, className: "h-14 rounded-lg bg-gray-100 animate-pulse" }))))) : error ? (React.createElement(Card, { className: "p-5 border-red-200 bg-red-50" },
            React.createElement("p", { className: "text-sm text-red-700" }, error === 'Unauthorized'
                ? 'Not signed in. Please sign in with GitHub to manage content.'
                : error))) : files.length === 0 ? (React.createElement("div", { className: "text-center py-16" },
            React.createElement("p", { className: "text-gray-500 mb-4" }, "No files found."),
            React.createElement(Button, { onClick: onCreateNew }, "Create your first file"))) : (React.createElement("div", { className: "space-y-2" },
            files.map((file) => (React.createElement("button", { key: file.path, onClick: () => onSelectFile(file.path), className: "w-full text-left group" },
                React.createElement(Card, { className: "px-4 py-3 hover:shadow-md transition-shadow cursor-pointer" },
                    React.createElement("span", { className: "font-medium text-gray-800 group-hover:text-blue-600 transition-colors" }, file.name))))),
            React.createElement("button", { onClick: onCreateNew, className: "w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium" }, "+ New file")))));
}
