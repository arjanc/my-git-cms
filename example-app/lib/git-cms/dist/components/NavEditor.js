'use client';
import React, { useState, useEffect } from 'react';
// Inlined so this client component has zero server-only dependencies
function parseNavInline(content) {
    try {
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.items))
            return parsed;
    }
    catch { /* ignore */ }
    return { items: [] };
}
function emptyItem() {
    return { title: '', href: '/' };
}
export function NavEditor({ navPath, apiBasePath, onBack }) {
    const [nav, setNav] = useState({ items: [] });
    const [sha, setSha] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadNav();
    }, [navPath]);
    async function loadNav() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${apiBasePath}/${navPath}`);
            if (res.status === 404) {
                setNav({ items: [] });
                setSha(undefined);
                return;
            }
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? 'Failed to load navigation');
                return;
            }
            const data = await res.json();
            setSha(data.sha);
            setNav(parseNavInline(data.content ?? '{}'));
        }
        catch {
            setError('Failed to load navigation');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${apiBasePath}/${navPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: navPath,
                    content: JSON.stringify(nav, null, 2),
                    message: sha ? 'Update navigation' : 'Create navigation',
                    ...(sha ? { sha } : {}),
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? 'Failed to save');
                return;
            }
            // Reload to pick up the new sha after creation
            await loadNav();
        }
        catch {
            setError('Failed to save');
        }
        finally {
            setSaving(false);
        }
    }
    // ─── Top-level item mutations ─────────────────────────────────────────────
    function addTopLevel() {
        setNav({ items: [...nav.items, emptyItem()] });
    }
    function removeTopLevel(index) {
        setNav({ items: nav.items.filter((_, i) => i !== index) });
    }
    function updateTopLevel(index, updated) {
        const items = [...nav.items];
        items[index] = updated;
        setNav({ items });
    }
    function moveTopUp(index) {
        if (index === 0)
            return;
        const items = [...nav.items];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        setNav({ items });
    }
    function moveTopDown(index) {
        if (index === nav.items.length - 1)
            return;
        const items = [...nav.items];
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        setNav({ items });
    }
    // ─── Child item mutations ─────────────────────────────────────────────────
    function addChild(parentIndex) {
        const items = [...nav.items];
        const parent = { ...items[parentIndex] };
        parent.children = [...(parent.children ?? []), emptyItem()];
        items[parentIndex] = parent;
        setNav({ items });
    }
    function removeChild(parentIndex, childIndex) {
        const items = [...nav.items];
        const parent = { ...items[parentIndex] };
        parent.children = (parent.children ?? []).filter((_, i) => i !== childIndex);
        items[parentIndex] = parent;
        setNav({ items });
    }
    function updateChild(parentIndex, childIndex, updated) {
        const items = [...nav.items];
        const parent = { ...items[parentIndex] };
        const children = [...(parent.children ?? [])];
        children[childIndex] = updated;
        parent.children = children;
        items[parentIndex] = parent;
        setNav({ items });
    }
    function moveChildUp(parentIndex, childIndex) {
        if (childIndex === 0)
            return;
        const items = [...nav.items];
        const parent = { ...items[parentIndex] };
        const children = [...(parent.children ?? [])];
        [children[childIndex - 1], children[childIndex]] = [children[childIndex], children[childIndex - 1]];
        parent.children = children;
        items[parentIndex] = parent;
        setNav({ items });
    }
    function moveChildDown(parentIndex, childIndex) {
        const items = [...nav.items];
        const parent = { ...items[parentIndex] };
        const children = [...(parent.children ?? [])];
        if (childIndex === children.length - 1)
            return;
        [children[childIndex], children[childIndex + 1]] = [children[childIndex + 1], children[childIndex]];
        parent.children = children;
        items[parentIndex] = parent;
        setNav({ items });
    }
    // ─── Render ───────────────────────────────────────────────────────────────
    if (loading)
        return React.createElement("div", { className: "py-8 text-gray-500" }, "Loading navigation...");
    const inputClass = 'border rounded px-2 py-1 text-sm w-full';
    const btnSmall = 'px-2 py-1 text-xs border rounded hover:bg-gray-50';
    const btnDanger = 'px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50';
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-800" }, "Navigation"),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", { onClick: onBack, className: "px-4 py-2 text-gray-600 hover:text-gray-900" }, "\u2190 Back"),
                React.createElement("button", { onClick: handleSave, disabled: saving, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" }, saving ? 'Saving...' : 'Save'))),
        error && (React.createElement("div", { className: "p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm" }, error)),
        React.createElement("div", { className: "space-y-3" }, nav.items.map((item, idx) => (React.createElement("div", { key: idx, className: "bg-white border rounded-lg p-4 space-y-3 shadow-sm" },
            React.createElement("div", { className: "flex items-start gap-2" },
                React.createElement("div", { className: "flex-1 grid grid-cols-3 gap-2" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Title"),
                        React.createElement("input", { type: "text", value: item.title, onChange: (e) => updateTopLevel(idx, { ...item, title: e.target.value }), className: inputClass, placeholder: "Home" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Href"),
                        React.createElement("input", { type: "text", value: item.href, onChange: (e) => updateTopLevel(idx, { ...item, href: e.target.value }), className: inputClass, placeholder: "/" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" },
                            "Slug ",
                            React.createElement("span", { className: "text-gray-400 font-normal" }, "(optional)")),
                        React.createElement("input", { type: "text", value: item.slug ?? '', onChange: (e) => updateTopLevel(idx, { ...item, slug: e.target.value || undefined }), className: inputClass, placeholder: "home" }))),
                React.createElement("div", { className: "flex flex-col gap-1 pt-5" },
                    React.createElement("button", { onClick: () => moveTopUp(idx), className: btnSmall, title: "Move up" }, "\u2191"),
                    React.createElement("button", { onClick: () => moveTopDown(idx), className: btnSmall, title: "Move down" }, "\u2193"),
                    React.createElement("button", { onClick: () => removeTopLevel(idx), className: btnDanger, title: "Remove" }, "\u2715"))),
            (item.children ?? []).length > 0 && (React.createElement("div", { className: "ml-4 space-y-2 border-l-2 border-gray-100 pl-3" }, (item.children ?? []).map((child, cidx) => (React.createElement("div", { key: cidx, className: "flex items-start gap-2" },
                React.createElement("div", { className: "flex-1 grid grid-cols-3 gap-2" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-500 mb-1" }, "Title"),
                        React.createElement("input", { type: "text", value: child.title, onChange: (e) => updateChild(idx, cidx, { ...child, title: e.target.value }), className: inputClass, placeholder: "Sub-page" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-500 mb-1" }, "Href"),
                        React.createElement("input", { type: "text", value: child.href, onChange: (e) => updateChild(idx, cidx, { ...child, href: e.target.value }), className: inputClass, placeholder: "/about" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-gray-500 mb-1" },
                            "Slug ",
                            React.createElement("span", { className: "text-gray-400 font-normal" }, "(optional)")),
                        React.createElement("input", { type: "text", value: child.slug ?? '', onChange: (e) => updateChild(idx, cidx, {
                                ...child,
                                slug: e.target.value || undefined,
                            }), className: inputClass, placeholder: "about" }))),
                React.createElement("div", { className: "flex flex-col gap-1 pt-5" },
                    React.createElement("button", { onClick: () => moveChildUp(idx, cidx), className: btnSmall, title: "Move up" }, "\u2191"),
                    React.createElement("button", { onClick: () => moveChildDown(idx, cidx), className: btnSmall, title: "Move down" }, "\u2193"),
                    React.createElement("button", { onClick: () => removeChild(idx, cidx), className: btnDanger, title: "Remove" }, "\u2715"))))))),
            React.createElement("button", { onClick: () => addChild(idx), className: "text-xs text-blue-600 hover:underline" }, "+ Add child item"))))),
        React.createElement("button", { onClick: addTopLevel, className: "w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors" }, "+ Add navigation item")));
}
