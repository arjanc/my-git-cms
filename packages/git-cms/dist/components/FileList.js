'use client';
import React, { useState, useEffect } from 'react';
export function FileList({ onSelectFile, onBack, contentPath }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadFiles();
    }, []);
    const loadFiles = async () => {
        try {
            const response = await fetch(`/api/cms/${contentPath}`);
            const data = await response.json();
            setFiles(data);
        }
        catch (error) {
            console.error('Error loading files:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h2", { className: "text-2xl font-bold" }, "Pages"),
            React.createElement("button", { onClick: onBack, className: "px-4 py-2 text-gray-600 hover:text-gray-900" }, "\u2190 Back")),
        loading ? (React.createElement("p", null, "Loading files...")) : (React.createElement("div", { className: "space-y-2" }, files.map((file) => (React.createElement("button", { key: file.path, onClick: () => onSelectFile(file.path), className: "w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left" },
            React.createElement("span", { className: "font-medium" }, file.name))))))));
}
