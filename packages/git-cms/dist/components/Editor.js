'use client';
import React, { useState, useEffect } from 'react';
export function Editor({ filePath, onBack, basePath }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (filePath) {
            loadFile(filePath);
        }
    }, [filePath]);
    const loadFile = async (path) => {
        try {
            const response = await fetch(`/api/cms/${path}`);
            const data = await response.json();
            setContent(data.content);
        }
        catch (error) {
            console.error('Error loading file:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        if (!filePath)
            return;
        try {
            await fetch(`/api/cms/${filePath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: filePath,
                    content,
                    message: `Update ${filePath}`,
                }),
            });
            alert('Saved successfully!');
        }
        catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save');
        }
    };
    if (loading) {
        return React.createElement("div", null, "Loading editor...");
    }
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h2", { className: "text-2xl font-bold" }, "Editor"),
            React.createElement("div", { className: "space-x-2" },
                React.createElement("button", { onClick: onBack, className: "px-4 py-2 text-gray-600 hover:text-gray-900" }, "\u2190 Back"),
                React.createElement("button", { onClick: handleSave, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" }, "Save"))),
        React.createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
            React.createElement("textarea", { value: content, onChange: (e) => setContent(e.target.value), className: "w-full h-96 p-4 border rounded font-mono text-sm", placeholder: "Edit your content..." }))));
}
