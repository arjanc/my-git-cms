'use client';
import React, { useState, useEffect } from 'react';
import { BlockEditor } from './BlockEditor';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
function generateBlockId() {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function SettingsEditor({ settingsPath, apiBasePath = '/admin/api/cms', blockSchemas, onBack, }) {
    const [settings, setSettings] = useState({});
    const [fileSha, setFileSha] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [saveError, setSaveError] = useState(null);
    useEffect(() => {
        loadSettings();
    }, [settingsPath]);
    async function loadSettings() {
        setLoading(true);
        try {
            const response = await fetch(`${apiBasePath}/${settingsPath}`);
            if (response.status === 404) {
                setSettings({});
                setFileSha(undefined);
                return;
            }
            const data = await response.json();
            setFileSha(data.sha);
            if (data.content) {
                try {
                    setSettings(JSON.parse(data.content));
                }
                catch {
                    setSettings({});
                }
            }
        }
        catch (err) {
            console.error('Error loading settings:', err);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSave() {
        setSaving(true);
        setSaveStatus('idle');
        setSaveError(null);
        try {
            const content = JSON.stringify(settings, null, 2);
            const body = {
                path: settingsPath,
                content,
                message: 'Update settings',
            };
            if (fileSha)
                body.sha = fileSha;
            const response = await fetch(`${apiBasePath}/${settingsPath}`, {
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
            const data = await response.json();
            if (data.sha)
                setFileSha(data.sha);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
        catch (err) {
            console.error('Error saving settings:', err);
            setSaveError('Failed to save');
            setSaveStatus('error');
        }
        finally {
            setSaving(false);
        }
    }
    function set(key, value) {
        setSettings((prev) => ({ ...prev, [key]: value || undefined }));
    }
    function handleAddBlock(type) {
        const schema = blockSchemas?.find((s) => s.type === type);
        if (!schema)
            return;
        const newBlock = { id: generateBlockId(), type };
        for (const field of schema.fields) {
            if (field.defaultValue !== undefined)
                newBlock[field.name] = field.defaultValue;
        }
        setSettings((prev) => ({
            ...prev,
            footerBlocks: [...(prev.footerBlocks ?? []), newBlock],
        }));
    }
    function handleBlockChange(index, updated) {
        const blocks = [...(settings.footerBlocks ?? [])];
        blocks[index] = updated;
        setSettings((prev) => ({ ...prev, footerBlocks: blocks }));
    }
    function handleBlockRemove(index) {
        setSettings((prev) => ({
            ...prev,
            footerBlocks: (prev.footerBlocks ?? []).filter((_, i) => i !== index),
        }));
    }
    function handleMoveUp(index) {
        if (index === 0)
            return;
        const blocks = [...(settings.footerBlocks ?? [])];
        [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
        setSettings((prev) => ({ ...prev, footerBlocks: blocks }));
    }
    function handleMoveDown(index) {
        const blocks = settings.footerBlocks ?? [];
        if (index === blocks.length - 1)
            return;
        const updated = [...blocks];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setSettings((prev) => ({ ...prev, footerBlocks: updated }));
    }
    if (loading) {
        return (React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "h-10 w-64 bg-gray-100 rounded animate-pulse" }),
            React.createElement("div", { className: "h-48 bg-gray-100 rounded animate-pulse" })));
    }
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between gap-4" },
            React.createElement("h2", { className: "text-lg font-semibold text-gray-800" }, "General Settings"),
            React.createElement("div", { className: "flex items-center gap-2 shrink-0" },
                saveStatus === 'saved' && (React.createElement("span", { className: "text-sm text-green-600 font-medium" }, "Saved \u2713")),
                saveStatus === 'error' && saveError && (React.createElement("span", { className: "text-sm text-red-600" }, saveError)),
                React.createElement(Button, { variant: "ghost", size: "sm", onClick: onBack }, "\u2190 Back"),
                React.createElement(Button, { size: "sm", onClick: handleSave, disabled: saving }, saving ? 'Saving…' : 'Save'))),
        React.createElement(Card, null,
            React.createElement(CardHeader, null,
                React.createElement(CardTitle, { className: "text-sm" }, "General")),
            React.createElement(CardContent, { className: "space-y-3" },
                React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" },
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "siteName" }, "Site name"),
                        React.createElement(Input, { id: "siteName", value: settings.siteName ?? '', onChange: (e) => set('siteName', e.target.value), placeholder: "My Site" })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "author" }, "Author"),
                        React.createElement(Input, { id: "author", value: settings.author ?? '', onChange: (e) => set('author', e.target.value), placeholder: "Jane Doe" }))),
                React.createElement("div", { className: "space-y-1" },
                    React.createElement(Label, { htmlFor: "siteDescription" }, "Site description"),
                    React.createElement(Input, { id: "siteDescription", value: settings.siteDescription ?? '', onChange: (e) => set('siteDescription', e.target.value), placeholder: "A short description of your site" })),
                React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" },
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "language" }, "Language"),
                        React.createElement(Input, { id: "language", value: settings.language ?? '', onChange: (e) => set('language', e.target.value), placeholder: "en" })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "themeColor" }, "Theme color"),
                        React.createElement(Input, { id: "themeColor", value: settings.themeColor ?? '', onChange: (e) => set('themeColor', e.target.value), placeholder: "#ffffff" }))),
                React.createElement("div", { className: "space-y-1" },
                    React.createElement(Label, { htmlFor: "faviconUrl" }, "Favicon URL"),
                    React.createElement(Input, { id: "faviconUrl", value: settings.faviconUrl ?? '', onChange: (e) => set('faviconUrl', e.target.value), placeholder: "/favicon.ico" })))),
        React.createElement(Card, null,
            React.createElement(CardHeader, null,
                React.createElement(CardTitle, { className: "text-sm" }, "SEO")),
            React.createElement(CardContent, { className: "space-y-3" },
                React.createElement("div", { className: "space-y-1" },
                    React.createElement(Label, { htmlFor: "canonicalBase" }, "Canonical base URL"),
                    React.createElement(Input, { id: "canonicalBase", value: settings.canonicalBase ?? '', onChange: (e) => set('canonicalBase', e.target.value), placeholder: "https://example.com" })),
                React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" },
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "robotsDirectives" }, "Robots directives"),
                        React.createElement(Input, { id: "robotsDirectives", value: settings.robotsDirectives ?? '', onChange: (e) => set('robotsDirectives', e.target.value), placeholder: "index, follow" })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(Label, { htmlFor: "ogImageUrl" }, "Default OG image URL"),
                        React.createElement(Input, { id: "ogImageUrl", value: settings.ogImageUrl ?? '', onChange: (e) => set('ogImageUrl', e.target.value), placeholder: "/og-image.png" }))))),
        blockSchemas && blockSchemas.length > 0 && (React.createElement(React.Fragment, null,
            (settings.footerBlocks ?? []).map((block, index) => {
                const schema = blockSchemas.find((s) => s.type === block.type);
                if (!schema)
                    return null;
                return (React.createElement(BlockEditor, { key: block.id, block: block, schema: schema, blockSchemas: blockSchemas, onChange: (updated) => handleBlockChange(index, updated), onRemove: () => handleBlockRemove(index), onMoveUp: () => handleMoveUp(index), onMoveDown: () => handleMoveDown(index), apiBasePath: apiBasePath }));
            }),
            React.createElement(Card, null,
                React.createElement(CardContent, { className: "pt-5" },
                    React.createElement("p", { className: "text-sm font-medium text-gray-700 mb-3" }, "Add footer block"),
                    React.createElement("div", { className: "flex flex-wrap gap-2" }, blockSchemas.map((schema) => (React.createElement(Button, { key: schema.type, variant: "outline", size: "sm", onClick: () => handleAddBlock(schema.type) },
                        "+ ",
                        schema.label))))))))));
}
