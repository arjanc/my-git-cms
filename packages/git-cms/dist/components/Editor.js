'use client';
import React, { useState, useEffect } from 'react';
import { BlockEditor } from './BlockEditor';
// Inlined so this client component has zero server-only dependencies (no gray-matter)
function generateBlockId() {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function Editor({ filePath, isCreating = false, contentPath, onBack, onCreated, apiBasePath = '/admin/api/cms', blockSchemas, pageSchemas, }) {
    const [rawContent, setRawContent] = useState('');
    const [pageContent, setPageContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fileSha, setFileSha] = useState(undefined);
    const [newFileName, setNewFileName] = useState('');
    const schema = pageSchemas?.find((s) => s.contentPath.includes(contentPath || ''));
    useEffect(() => {
        if (filePath) {
            loadFile(filePath);
        }
        else if (isCreating) {
            // New file — initialise empty state, skip loading
            setRawContent('');
            setPageContent(blockSchemas && blockSchemas.length > 0
                ? { title: '', slug: '', description: '', blocks: [], pageSchema: schema?.type }
                : null);
            setFileSha(undefined);
            setNewFileName('');
            setLoading(false);
        }
    }, [filePath, isCreating]);
    async function loadFile(path) {
        setLoading(true);
        try {
            const response = await fetch(`${apiBasePath}/${path}`);
            const data = await response.json();
            const raw = data.content ?? '';
            setRawContent(raw);
            setFileSha(data.sha);
            // pageContent is parsed server-side by the API handler (gray-matter stays server-side)
            if (blockSchemas && blockSchemas.length > 0 && data.pageContent) {
                setPageContent(data.pageContent);
            }
        }
        catch (err) {
            console.error('Error loading file:', err);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSave() {
        let targetPath = filePath;
        if (isCreating) {
            const name = newFileName.trim();
            if (!name) {
                alert('Please enter a file name.');
                return;
            }
            const safeName = name.endsWith('.md') ? name : `${name}.md`;
            targetPath = contentPath ? `${contentPath}/${safeName}` : safeName;
        }
        if (!targetPath)
            return;
        setSaving(true);
        try {
            const isNew = isCreating;
            const message = isNew ? `Create ${targetPath}` : `Update ${targetPath}`;
            const body = blockSchemas && blockSchemas.length > 0 && pageContent
                ? { path: targetPath, pageContent, message, ...(isNew ? {} : { sha: fileSha }) }
                : { path: targetPath, content: rawContent, message, ...(isNew ? {} : { sha: fileSha }) };
            const response = await fetch(`${apiBasePath}/${targetPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const data = await response.json();
                alert(`Failed to save: ${data.error ?? 'Unknown error'}`);
                return;
            }
            if (isNew && onCreated) {
                onCreated(targetPath);
            }
            else {
                alert('Saved successfully!');
            }
        }
        catch (err) {
            console.error('Error saving:', err);
            alert('Failed to save');
        }
        finally {
            setSaving(false);
        }
    }
    function handleAddBlock(type) {
        if (!pageContent)
            return;
        const schema = blockSchemas?.find((s) => s.type === type);
        if (!schema)
            return;
        const newBlock = { id: generateBlockId(), type };
        for (const field of schema.fields) {
            if (field.defaultValue !== undefined)
                newBlock[field.name] = field.defaultValue;
        }
        setPageContent({ ...pageContent, blocks: [...pageContent.blocks, newBlock] });
    }
    function handleBlockChange(index, updated) {
        if (!pageContent)
            return;
        const blocks = [...pageContent.blocks];
        blocks[index] = updated;
        setPageContent({ ...pageContent, blocks });
    }
    function handleBlockRemove(index) {
        if (!pageContent)
            return;
        setPageContent({ ...pageContent, blocks: pageContent.blocks.filter((_, i) => i !== index) });
    }
    function handleMoveUp(index) {
        if (!pageContent || index === 0)
            return;
        const blocks = [...pageContent.blocks];
        [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
        setPageContent({ ...pageContent, blocks });
    }
    function handleMoveDown(index) {
        if (!pageContent || index === pageContent.blocks.length - 1)
            return;
        const blocks = [...pageContent.blocks];
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        setPageContent({ ...pageContent, blocks });
    }
    if (loading)
        return React.createElement("div", null, "Loading editor...");
    const useSchemaEditor = !!(blockSchemas && blockSchemas.length > 0 && pageContent);
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            isCreating ? (React.createElement("div", { className: "flex items-center gap-2 flex-1 mr-4" },
                React.createElement("span", { className: "text-sm text-gray-500 whitespace-nowrap" }, "New file:"),
                React.createElement("input", { type: "text", value: newFileName, onChange: (e) => setNewFileName(e.target.value), placeholder: "my-page.md", className: "border rounded px-3 py-1.5 text-sm flex-1 max-w-xs", autoFocus: true }))) : (React.createElement("h2", { className: "text-xl font-bold truncate max-w-sm text-gray-800" }, filePath)),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", { onClick: onBack, className: "px-4 py-2 text-gray-600 hover:text-gray-900" }, "\u2190 Back"),
                React.createElement("button", { onClick: handleSave, disabled: saving || (isCreating && !newFileName.trim()), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" }, saving ? 'Saving…' : isCreating ? 'Create' : 'Save'))),
        useSchemaEditor ? (React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow space-y-3" },
                React.createElement("h3", { className: "font-semibold text-sm text-gray-700" }, "Page settings"),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Title"),
                    React.createElement("input", { type: "text", value: pageContent.title, onChange: (e) => setPageContent({ ...pageContent, title: e.target.value }), className: "w-full border rounded px-3 py-2 text-sm" })),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Slug"),
                    React.createElement("input", { type: "text", value: pageContent.slug, onChange: (e) => setPageContent({ ...pageContent, slug: e.target.value }), className: "w-full border rounded px-3 py-2 text-sm" })),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Description"),
                    React.createElement("textarea", { value: pageContent.description ?? '', rows: 2, onChange: (e) => setPageContent({ ...pageContent, description: e.target.value }), className: "w-full border rounded px-3 py-2 text-sm" }))),
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow space-y-3" },
                React.createElement("h3", { className: "font-semibold text-sm text-gray-700" }, "Navigation"),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("input", { type: "checkbox", id: "navEnabled", checked: !!pageContent.navEnabled, onChange: (e) => setPageContent({ ...pageContent, navEnabled: e.target.checked || undefined }), className: "rounded" }),
                    React.createElement("label", { htmlFor: "navEnabled", className: "text-sm text-gray-700" }, "Show in navigation")),
                pageContent.navEnabled && (React.createElement("div", { className: "space-y-3 pt-1" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" },
                            "Nav label ",
                            React.createElement("span", { className: "text-gray-400 font-normal" }, "(defaults to title)")),
                        React.createElement("input", { type: "text", value: pageContent.navTitle ?? '', onChange: (e) => setPageContent({ ...pageContent, navTitle: e.target.value || undefined }), placeholder: pageContent.title || 'Page title', className: "w-full border rounded px-3 py-2 text-sm" })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" },
                                "Order ",
                                React.createElement("span", { className: "text-gray-400 font-normal" }, "(ascending)")),
                            React.createElement("input", { type: "number", value: pageContent.navOrder ?? '', onChange: (e) => setPageContent({ ...pageContent, navOrder: e.target.value ? Number(e.target.value) : undefined }), placeholder: "0", className: "w-full border rounded px-3 py-2 text-sm" })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" },
                                "Parent slug ",
                                React.createElement("span", { className: "text-gray-400 font-normal" }, "(e.g. /about)")),
                            React.createElement("input", { type: "text", value: pageContent.navParent ?? '', onChange: (e) => setPageContent({ ...pageContent, navParent: e.target.value || undefined }), placeholder: "/parent-page", className: "w-full border rounded px-3 py-2 text-sm" })))))),
            pageContent.blocks.map((block, index) => {
                const schema = blockSchemas.find((s) => s.type === block.type);
                if (!schema)
                    return null;
                return (React.createElement(BlockEditor, { key: block.id, block: block, schema: schema, onChange: (updated) => handleBlockChange(index, updated), onRemove: () => handleBlockRemove(index), onMoveUp: () => handleMoveUp(index), onMoveDown: () => handleMoveDown(index) }));
            }),
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                React.createElement("p", { className: "text-sm font-medium text-gray-700 mb-2" }, "Add block"),
                React.createElement("div", { className: "flex flex-wrap gap-2" }, blockSchemas.map((schema) => (React.createElement("button", { key: schema.type, onClick: () => handleAddBlock(schema.type), className: "px-3 py-1.5 text-sm border rounded hover:bg-gray-50" },
                    "+ ",
                    schema.label))))))) : (React.createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
            React.createElement("textarea", { value: rawContent, onChange: (e) => setRawContent(e.target.value), className: "w-full h-96 p-4 border rounded font-mono text-sm", placeholder: "Edit your content..." })))));
}
