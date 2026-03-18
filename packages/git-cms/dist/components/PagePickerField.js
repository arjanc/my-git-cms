'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from './ui/dialog';
async function fetchPagesFromPath(apiBasePath, contentPath) {
    const res = await fetch(`${apiBasePath}/${contentPath}`);
    if (!res.ok)
        return [];
    const items = await res.json();
    if (!Array.isArray(items))
        return [];
    const mdFiles = items.filter((item) => item.type === 'file' && item.name.endsWith('.md'));
    return Promise.all(mdFiles.map(async (item) => {
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
}
export function PagePickerField({ field, contentPaths, value, onChange, apiBasePath, excludeSlug, placeholder, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Resolve which paths to fetch from
    const resolvedPaths = contentPaths && contentPaths.length > 0
        ? contentPaths
        : field?.contentPath
            ? [field.contentPath]
            : [];
    const loadPages = async () => {
        if (resolvedPaths.length === 0)
            return;
        setLoading(true);
        setError(null);
        try {
            const results = await Promise.all(resolvedPaths.map((p) => fetchPagesFromPath(apiBasePath, p)));
            const all = results.flat();
            // Deduplicate by slug, then exclude the current page if needed
            const seen = new Set();
            const filtered = [];
            for (const page of all) {
                if (seen.has(page.slug))
                    continue;
                seen.add(page.slug);
                if (excludeSlug && page.slug === excludeSlug)
                    continue;
                filtered.push(page);
            }
            // Sort alphabetically by title
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            setPages(filtered);
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
    const hasContent = resolvedPaths.length > 0;
    return (React.createElement("div", { className: "flex gap-2" },
        React.createElement(Input, { value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder ?? field?.label ?? 'Enter URL or select a page', className: "flex-1" }),
        React.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: handleOpen, disabled: !hasContent, className: "shrink-0" }, "Select page"),
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
