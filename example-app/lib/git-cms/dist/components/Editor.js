'use client';
import React, { useState, useEffect } from 'react';
import { BlockEditor } from './BlockEditor';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// Inlined so this client component has zero server-only dependencies (no gray-matter)
function generateBlockId() {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function Editor({ filePath, isCreating = false, contentPath, onBack, onCreated, apiBasePath = '/admin/api/cms', blockSchemas, pageSchemas, }) {
    const [rawContent, setRawContent] = useState('');
    const [pageContent, setPageContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [saveError, setSaveError] = useState(null);
    const [fileSha, setFileSha] = useState(undefined);
    const [newFileName, setNewFileName] = useState('');
    const schema = pageSchemas?.find((s) => s.contentPath.includes(contentPath || ''));
    useEffect(() => {
        if (filePath) {
            loadFile(filePath);
        }
        else if (isCreating) {
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
                setSaveError('Please enter a file name.');
                setSaveStatus('error');
                return;
            }
            const safeName = name.endsWith('.md') ? name : `${name}.md`;
            targetPath = contentPath ? `${contentPath}/${safeName}` : safeName;
        }
        if (!targetPath)
            return;
        setSaving(true);
        setSaveStatus('idle');
        setSaveError(null);
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
                setSaveError(data.error ?? 'Unknown error');
                setSaveStatus('error');
                return;
            }
            if (isNew && onCreated) {
                onCreated(targetPath);
            }
            else {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        }
        catch (err) {
            console.error('Error saving:', err);
            setSaveError('Failed to save');
            setSaveStatus('error');
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
    if (loading) {
        return (React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "h-10 w-64 bg-gray-100 rounded animate-pulse" }),
            React.createElement("div", { className: "h-48 bg-gray-100 rounded animate-pulse" })));
    }
    const useSchemaEditor = !!(blockSchemas && blockSchemas.length > 0 && pageContent);
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between gap-4" },
            isCreating ? (React.createElement("div", { className: "flex items-center gap-2 flex-1" },
                React.createElement(Label, { htmlFor: "new-file-name", className: "whitespace-nowrap text-gray-500" }, "New file:"),
                React.createElement(Input, { id: "new-file-name", value: newFileName, onChange: (e) => setNewFileName(e.target.value), placeholder: "my-page.md", className: "max-w-xs", autoFocus: true }))) : (React.createElement("h2", { className: "text-lg font-semibold text-gray-800 truncate max-w-md" }, filePath)),
            React.createElement("div", { className: "flex items-center gap-2 shrink-0" },
                saveStatus === 'saved' && (React.createElement("span", { className: "text-sm text-green-600 font-medium" }, "Saved \u2713")),
                saveStatus === 'error' && saveError && (React.createElement("span", { className: "text-sm text-red-600" }, saveError)),
                React.createElement(Button, { variant: "ghost", size: "sm", onClick: onBack }, "\u2190 Back"),
                React.createElement(Button, { size: "sm", onClick: handleSave, disabled: saving || (isCreating && !newFileName.trim()) }, saving ? 'Saving…' : isCreating ? 'Create' : 'Save'))),
        useSchemaEditor ? (React.createElement("div", { className: "space-y-4" },
            React.createElement(Card, null,
                React.createElement(CardHeader, null,
                    React.createElement(CardTitle, { className: "text-sm" }, "Page settings")),
                React.createElement(CardContent, { className: "space-y-3" },
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "page-title" }, "Title"),
                        React.createElement(Input, { id: "page-title", value: pageContent.title, onChange: (e) => setPageContent({ ...pageContent, title: e.target.value }) })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "page-slug" }, "Slug"),
                        React.createElement(Input, { id: "page-slug", value: pageContent.slug, onChange: (e) => setPageContent({ ...pageContent, slug: e.target.value }) })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "page-desc" }, "Description"),
                        React.createElement(Textarea, { id: "page-desc", value: pageContent.description ?? '', rows: 2, onChange: (e) => setPageContent({ ...pageContent, description: e.target.value }) })))),
            React.createElement(Card, null,
                React.createElement(CardHeader, null,
                    React.createElement(CardTitle, { className: "text-sm" }, "Navigation")),
                React.createElement(CardContent, { className: "space-y-3" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("input", { type: "checkbox", id: "navEnabled", checked: !!pageContent.navEnabled, onChange: (e) => setPageContent({
                                ...pageContent,
                                navEnabled: e.target.checked || undefined,
                            }), className: "h-4 w-4 rounded border-gray-300" }),
                        React.createElement("label", { htmlFor: "navEnabled", className: "text-sm text-gray-700" }, "Show in navigation")),
                    pageContent.navEnabled && (React.createElement("div", { className: "space-y-3 pt-1" },
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement(Label, { htmlFor: "navTitle" },
                                "Nav label",
                                ' ',
                                React.createElement("span", { className: "text-gray-400 font-normal" }, "(defaults to title)")),
                            React.createElement(Input, { id: "navTitle", value: pageContent.navTitle ?? '', onChange: (e) => setPageContent({
                                    ...pageContent,
                                    navTitle: e.target.value || undefined,
                                }), placeholder: pageContent.title || 'Page title' })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(Label, { htmlFor: "navOrder" },
                                    "Order ",
                                    React.createElement("span", { className: "text-gray-400 font-normal" }, "(ascending)")),
                                React.createElement(Input, { id: "navOrder", type: "number", value: pageContent.navOrder ?? '', onChange: (e) => setPageContent({
                                        ...pageContent,
                                        navOrder: e.target.value ? Number(e.target.value) : undefined,
                                    }), placeholder: "0" })),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement(Label, { htmlFor: "navParent" },
                                    "Parent slug",
                                    ' ',
                                    React.createElement("span", { className: "text-gray-400 font-normal" }, "(e.g. /about)")),
                                React.createElement(Input, { id: "navParent", value: pageContent.navParent ?? '', onChange: (e) => setPageContent({
                                        ...pageContent,
                                        navParent: e.target.value || undefined,
                                    }), placeholder: "/parent-page" }))))))),
            pageContent.blocks.map((block, index) => {
                const schema = blockSchemas.find((s) => s.type === block.type);
                if (!schema)
                    return null;
                return (React.createElement(BlockEditor, { key: block.id, block: block, schema: schema, onChange: (updated) => handleBlockChange(index, updated), onRemove: () => handleBlockRemove(index), onMoveUp: () => handleMoveUp(index), onMoveDown: () => handleMoveDown(index) }));
            }),
            React.createElement(Card, null,
                React.createElement(CardContent, { className: "pt-5" },
                    React.createElement("p", { className: "text-sm font-medium text-gray-700 mb-3" }, "Add block"),
                    React.createElement("div", { className: "flex flex-wrap gap-2" }, blockSchemas.map((schema) => (React.createElement(Button, { key: schema.type, variant: "outline", size: "sm", onClick: () => handleAddBlock(schema.type) },
                        "+ ",
                        schema.label)))))))) : (React.createElement(Card, null,
            React.createElement(CardContent, { className: "pt-5" },
                React.createElement(Textarea, { value: rawContent, onChange: (e) => setRawContent(e.target.value), className: "h-96 font-mono text-sm", placeholder: "Edit your content..." }))))));
}
