'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
async function loadPageDetail(file, apiBasePath) {
    try {
        const res = await fetch(`${apiBasePath}/${file.path}`);
        const data = await res.json();
        const pc = data.pageContent;
        return {
            ...file,
            pageTitle: pc?.title ?? file.name.replace(/\.md$/, ''),
            navOrder: typeof pc?.navOrder === 'number' ? pc.navOrder : Infinity,
            navParent: pc?.navParent ?? null,
            slug: pc?.slug ?? null,
            children: [],
        };
    }
    catch {
        return {
            ...file,
            pageTitle: file.name.replace(/\.md$/, ''),
            navOrder: Infinity,
            navParent: null,
            slug: null,
            children: [],
        };
    }
}
function buildTree(pages) {
    const sorted = [...pages].sort((a, b) => {
        if (a.navOrder !== b.navOrder)
            return a.navOrder - b.navOrder;
        return a.pageTitle.localeCompare(b.pageTitle);
    });
    const bySlug = new Map();
    for (const page of sorted) {
        if (page.slug)
            bySlug.set(page.slug, page);
    }
    const roots = [];
    for (const page of sorted) {
        if (page.navParent) {
            const parent = bySlug.get(page.navParent);
            if (parent) {
                parent.children.push(page);
                continue;
            }
        }
        roots.push(page);
    }
    return roots;
}
function TreeNode({ page, depth, onSelectFile }) {
    const hasChildren = page.children.length > 0;
    const isChild = depth > 0;
    return (React.createElement("div", null,
        React.createElement("button", { onClick: () => onSelectFile(page.path), className: "w-full text-left group" },
            React.createElement(Card, { className: `px-4 py-3 hover:shadow-md transition-shadow cursor-pointer ${isChild ? 'bg-neutral-50 border-neutral-200' : ''}` },
                React.createElement("div", { className: "flex items-center gap-2" },
                    isChild && (React.createElement("span", { className: "text-neutral-400 text-xs select-none flex-shrink-0" }, "\u2514")),
                    React.createElement("div", { className: "min-w-0 flex-1" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: `font-medium truncate group-hover:text-blue-600 transition-colors ${isChild ? 'text-sm text-gray-700' : 'text-gray-800'}` }, page.pageTitle),
                            hasChildren && (React.createElement("span", { className: "flex-shrink-0 text-xs text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5 leading-none" }, page.children.length))),
                        React.createElement("span", { className: "text-xs text-gray-400 font-mono" }, page.name))))),
        hasChildren && (React.createElement("div", { className: "mt-2 space-y-2 ml-5 pl-3 border-l-2 border-neutral-200" }, page.children.map((child) => (React.createElement(TreeNode, { key: child.path, page: child, depth: depth + 1, onSelectFile: onSelectFile })))))));
}
export function FileList({ onSelectFile, onCreateNew, onBack, contentPath, apiBasePath = '/admin/api/cms', }) {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadFiles();
    }, []);
    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBasePath}/${contentPath}`);
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Failed to load files');
                return;
            }
            const allFiles = Array.isArray(data) ? data : [];
            const mdFiles = allFiles.filter((f) => f.type === 'file' && f.name.endsWith('.md'));
            if (mdFiles.length === 0) {
                setTree([]);
                return;
            }
            // Fetch each file's page content in parallel to get title + nav fields
            const details = await Promise.all(mdFiles.map((f) => loadPageDetail(f, apiBasePath)));
            const hasNavData = details.some((d) => d.navParent !== null);
            if (hasNavData) {
                setTree(buildTree(details));
            }
            else {
                // No parent-child data — show sorted flat list
                setTree([...details].sort((a, b) => {
                    if (a.navOrder !== b.navOrder)
                        return a.navOrder - b.navOrder;
                    return a.pageTitle.localeCompare(b.pageTitle);
                }));
            }
        }
        catch {
            setError('Failed to load files');
        }
        finally {
            setLoading(false);
        }
    };
    const label = contentPath.split('/').pop() ?? 'Pages';
    return (React.createElement("div", { className: "space-y-5" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, label),
                React.createElement("p", { className: "mt-0.5 text-sm text-gray-500 font-mono" }, contentPath)),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(Button, { variant: "ghost", size: "sm", onClick: onBack }, "\u2190 Back"),
                React.createElement(Button, { size: "sm", onClick: onCreateNew }, "+ New"))),
        loading ? (React.createElement("div", { className: "space-y-2" }, [1, 2, 3].map((n) => (React.createElement("div", { key: n, className: "h-14 rounded-lg bg-gray-100 animate-pulse" }))))) : error ? (React.createElement(Card, { className: "p-5 border-red-200 bg-red-50" },
            React.createElement("p", { className: "text-sm text-red-700" }, error === 'Unauthorized'
                ? 'Not signed in. Please sign in with GitHub to manage content.'
                : error))) : (tree ?? []).length === 0 ? (React.createElement("div", { className: "text-center py-16" },
            React.createElement("p", { className: "text-gray-500 mb-4" }, "No files found."),
            React.createElement(Button, { onClick: onCreateNew }, "Create your first file"))) : (React.createElement("div", { className: "space-y-2" },
            (tree ?? []).map((page) => (React.createElement(TreeNode, { key: page.path, page: page, depth: 0, onSelectFile: onSelectFile }))),
            React.createElement("button", { onClick: onCreateNew, className: "w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium" }, "+ New file")))));
}
