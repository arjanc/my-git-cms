'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from './ui/dialog';
export function PagePickerField({ field, value, onChange, apiBasePath }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const contentPath = field.contentPath ?? '';
    const loadPages = async () => {
        if (!contentPath)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${apiBasePath}/${contentPath}`);
            if (!res.ok)
                throw new Error(`Failed to load pages (${res.status})`);
            const items = await res.json();
            if (!Array.isArray(items))
                throw new Error('Unexpected response');
            const mdFiles = items.filter((item) => item.type === 'file' && item.name.endsWith('.md'));
            const pageDetails = await Promise.all(mdFiles.map(async (item) => {
                try {
                    const fileRes = await fetch(`${apiBasePath}/${item.path}`);
                    const fileData = await fileRes.json();
                    const pc = fileData.pageContent;
                    return {
                        name: item.name,
                        path: item.path,
                        title: pc?.title ?? item.name.replace(/\.md$/, ''),
                        slug: pc?.slug ?? `/${item.name.replace(/\.md$/, '')}`,
                    };
                }
                catch {
                    return {
                        name: item.name,
                        path: item.path,
                        title: item.name.replace(/\.md$/, ''),
                        slug: `/${item.name.replace(/\.md$/, '')}`,
                    };
                }
            }));
            setPages(pageDetails);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load pages');
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpen = () => {
        setIsOpen(true);
        loadPages();
    };
    const handleSelect = (slug) => {
        onChange(slug);
        setIsOpen(false);
    };
    return (React.createElement("div", { className: "flex gap-2" },
        React.createElement(Input, { value: value, onChange: (e) => onChange(e.target.value), placeholder: field.label, className: "flex-1" }),
        React.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: handleOpen, disabled: !contentPath, className: "shrink-0" }, "Select page"),
        React.createElement(Dialog, { open: isOpen, onOpenChange: setIsOpen },
            React.createElement(DialogContent, { className: "max-w-md" },
                React.createElement(DialogHeader, null,
                    React.createElement(DialogTitle, null, "Select a page")),
                loading && (React.createElement("p", { className: "text-sm text-gray-500 py-4 text-center" }, "Loading pages\u2026")),
                error && (React.createElement("p", { className: "text-sm text-red-600 py-2" }, error)),
                !loading && !error && pages.length === 0 && (React.createElement("p", { className: "text-sm text-gray-400 py-4 text-center" }, "No pages found")),
                !loading && pages.length > 0 && (React.createElement("ul", { className: "space-y-1 max-h-80 overflow-y-auto -mx-1" }, pages.map((page) => {
                    const isSelected = value === page.slug;
                    return (React.createElement("li", { key: page.path },
                        React.createElement("button", { type: "button", onClick: () => handleSelect(page.slug), className: `w-full text-left px-3 py-2 rounded-md transition-colors ${isSelected
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'}` },
                            React.createElement("div", { className: "text-sm font-medium" }, page.title),
                            React.createElement("div", { className: "text-xs text-gray-400 font-mono" }, page.slug))));
                })))))));
}
