'use client';
import React, { useState } from 'react';
import { MediaManager } from './MediaManager';
import { Button } from './ui/button';
import { X } from 'lucide-react';
export function ImageField({ field, value, onChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (React.createElement("div", { className: "space-y-2" },
        React.createElement("div", { className: "flex flex-col gap-2" }, value ? (React.createElement("div", { className: "relative aspect-video w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50 overflow-hidden group" },
            React.createElement("img", { src: value, alt: "", className: "w-full h-full object-contain", onError: (e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFMkU4RjAiLz48cGF0aCBkPSJNMjAgMTJMMTIgMjBIMjhMMjAgMTJaIiBmaWxsPSIjOTQ0QjU1Ii8+PC9zdmc+';
                } }),
            React.createElement("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col gap-2" },
                React.createElement("span", { className: "text-[10px] text-white font-mono truncate px-4 w-full text-center" }, value),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(Button, { size: "sm", onClick: () => setIsModalOpen(true) }, "Change"),
                    React.createElement(Button, { variant: "destructive", size: "icon", onClick: () => onChange(''), title: "Remove image", className: "h-9 w-9" },
                        React.createElement(X, { className: "h-4 w-4" })))))) : (React.createElement("button", { onClick: () => setIsModalOpen(true), className: "w-full max-w-sm aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors" },
            React.createElement("svg", { className: "w-8 h-8 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })),
            React.createElement("span", { className: "text-sm font-medium" }, "Select Image from Library")))),
        isModalOpen && (React.createElement(MediaManager, { onClose: () => setIsModalOpen(false), onSelect: (url) => {
                onChange(url);
                setIsModalOpen(false);
            } }))));
}
