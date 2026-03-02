'use client';
// TiptapEditor.tsx — loaded lazily from RichTextEditor to avoid SSR.
// Classic JSX transform is active ("jsx": "react") so React must be imported.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Table, TableRow, TableCell, TableHeader, } from '@tiptap/extension-table';
import Link from '@tiptap/extension-link';
// Helper: access tiptap-markdown storage without relying on module augmentation.
// tiptap-markdown v0.9 does not augment @tiptap/core's Storage interface, so
// editor.storage is typed as the empty Storage interface. We cast through unknown.
function getMarkdown(editor) {
    if (!editor)
        return '';
    const storage = editor.storage['markdown'];
    if (storage && typeof storage.getMarkdown === 'function') {
        return storage.getMarkdown();
    }
    return editor.getText();
}
function ToolbarButton({ onClick, active, disabled, title, children }) {
    return (React.createElement("button", { type: "button", onMouseDown: (e) => {
            // Prevent the editor from losing focus when clicking toolbar buttons
            e.preventDefault();
            onClick();
        }, disabled: disabled, title: title, className: [
            'px-2 py-1 text-xs rounded border transition-colors',
            active
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ') }, children));
}
// ─── Separator ────────────────────────────────────────────────────────────────
function ToolbarSeparator() {
    return React.createElement("span", { className: "w-px h-5 bg-gray-200 mx-1 inline-block self-center" });
}
function LinkInput({ onConfirm, onCancel }) {
    const [url, setUrl] = useState('');
    return (React.createElement("div", { className: "flex items-center gap-2 px-2 py-1 bg-white border border-gray-300 rounded shadow-sm" },
        React.createElement("input", { autoFocus: true, type: "url", placeholder: "https://example.com", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onConfirm(url);
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancel();
                }
            }, className: "text-xs border-none outline-none w-48" }),
        React.createElement("button", { type: "button", onMouseDown: (e) => { e.preventDefault(); onConfirm(url); }, className: "text-xs text-blue-600 hover:underline" }, "OK"),
        React.createElement("button", { type: "button", onMouseDown: (e) => { e.preventDefault(); onCancel(); }, className: "text-xs text-gray-500 hover:underline" }, "Cancel")));
}
// ─── Main component ───────────────────────────────────────────────────────────
export function TiptapEditor({ value, onChange }) {
    const [showSource, setShowSource] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    // sourceText mirrors the markdown when the source view is open
    const [sourceText, setSourceText] = useState('');
    // Track whether the last content change originated inside the editor so we
    // can skip the sync-from-prop effect and avoid an infinite loop.
    const isInternalChange = useRef(false);
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                // We keep heading levels 1-3
                heading: { levels: [1, 2, 3] },
            }),
            // Markdown extension: enables setContent(markdownString) and provides
            // editor.storage['markdown'].getMarkdown() for serialisation back to MD.
            Markdown.configure({
                html: false, // do not allow raw HTML in output
                tightLists: true, // compact bullet lists
                transformCopiedText: true,
                transformPastedText: true,
            }),
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { rel: 'noopener noreferrer' },
            }),
        ],
        // tiptap-markdown makes setContent() accept markdown strings when the
        // Markdown extension is present — it parses the markdown into ProseMirror.
        content: value,
        onUpdate({ editor: ed }) {
            isInternalChange.current = true;
            onChange(getMarkdown(ed));
        },
    });
    // When the value prop changes externally (e.g. the parent resets the form),
    // sync the editor content — but only if the change did NOT originate here.
    useEffect(() => {
        if (!editor)
            return;
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        const current = getMarkdown(editor);
        if (current !== value) {
            // emitUpdate: false prevents triggering onUpdate, which would loop back.
            editor.commands.setContent(value, { emitUpdate: false });
        }
    }, [value, editor]);
    const handleToggleSource = useCallback(() => {
        if (!editor)
            return;
        if (!showSource) {
            // Opening source view: capture current markdown into textarea state
            setSourceText(getMarkdown(editor));
        }
        else {
            // Closing source view: push textarea value back into editor
            editor.commands.setContent(sourceText, { emitUpdate: false });
            isInternalChange.current = true;
            onChange(sourceText);
        }
        setShowSource((s) => !s);
    }, [editor, showSource, sourceText, onChange]);
    const handleSourceChange = useCallback((e) => {
        const md = e.target.value;
        setSourceText(md);
        // Propagate changes to the parent even while in source view
        isInternalChange.current = true;
        onChange(md);
    }, [onChange]);
    const handleLinkConfirm = useCallback((url) => {
        setShowLinkInput(false);
        if (!editor || !url.trim())
            return;
        editor.chain().focus().setLink({ href: url.trim() }).run();
    }, [editor]);
    const inTable = editor?.isActive('table') ?? false;
    if (!editor) {
        return React.createElement("div", { className: "w-full h-48 border rounded bg-gray-50 animate-pulse" });
    }
    return (React.createElement("div", { className: "border rounded-lg overflow-hidden bg-white" },
        React.createElement("div", { className: "flex flex-wrap items-center gap-1 px-2 py-1 border-b bg-gray-50 text-xs" },
            React.createElement(ToolbarButton, { title: "Bold (Ctrl+B)", active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
                React.createElement("strong", null, "B")),
            React.createElement(ToolbarButton, { title: "Italic (Ctrl+I)", active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
                React.createElement("em", null, "I")),
            React.createElement(ToolbarButton, { title: "Inline code", active: editor.isActive('code'), onClick: () => editor.chain().focus().toggleCode().run() }, '<>'),
            React.createElement(ToolbarSeparator, null),
            React.createElement(ToolbarButton, { title: "Heading 1", active: editor.isActive('heading', { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run() }, "H1"),
            React.createElement(ToolbarButton, { title: "Heading 2", active: editor.isActive('heading', { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() }, "H2"),
            React.createElement(ToolbarButton, { title: "Heading 3", active: editor.isActive('heading', { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() }, "H3"),
            React.createElement(ToolbarSeparator, null),
            React.createElement(ToolbarButton, { title: "Bullet list", active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() }, "\u2022\u2014"),
            React.createElement(ToolbarButton, { title: "Ordered list", active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() }, "1."),
            React.createElement(ToolbarButton, { title: "Blockquote", active: editor.isActive('blockquote'), onClick: () => editor.chain().focus().toggleBlockquote().run() }, "\u201C\u201D"),
            React.createElement(ToolbarButton, { title: "Code block", active: editor.isActive('codeBlock'), onClick: () => editor.chain().focus().toggleCodeBlock().run() }, '{ }'),
            React.createElement(ToolbarSeparator, null),
            showLinkInput ? (React.createElement(LinkInput, { onConfirm: handleLinkConfirm, onCancel: () => setShowLinkInput(false) })) : (React.createElement(ToolbarButton, { title: "Insert / edit link", active: editor.isActive('link'), onClick: () => setShowLinkInput(true) }, "Link")),
            React.createElement(ToolbarSeparator, null),
            React.createElement(ToolbarButton, { title: "Insert table (3x3)", onClick: () => editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run() }, "Table"),
            inTable && (React.createElement(React.Fragment, null,
                React.createElement(ToolbarButton, { title: "Add column after", onClick: () => editor.chain().focus().addColumnAfter().run() }, "+Col"),
                React.createElement(ToolbarButton, { title: "Delete column", onClick: () => editor.chain().focus().deleteColumn().run() }, "-Col"),
                React.createElement(ToolbarButton, { title: "Add row after", onClick: () => editor.chain().focus().addRowAfter().run() }, "+Row"),
                React.createElement(ToolbarButton, { title: "Delete row", onClick: () => editor.chain().focus().deleteRow().run() }, "-Row"))),
            React.createElement("span", { className: "ml-auto" },
                React.createElement(ToolbarButton, { title: "Toggle markdown source view", active: showSource, onClick: handleToggleSource }, "MD"))),
        showSource ? (React.createElement("textarea", { className: "w-full font-mono text-sm p-3 min-h-[12rem] outline-none resize-y", value: sourceText, onChange: handleSourceChange, spellCheck: false })) : (React.createElement(EditorContent, { editor: editor, className: [
                'prose prose-sm max-w-none p-3 min-h-[12rem]',
                'focus-within:outline-none',
                '[&_.ProseMirror]:outline-none',
                '[&_.ProseMirror]:min-h-[10rem]',
                // Table visual styles
                '[&_.ProseMirror_table]:border-collapse',
                '[&_.ProseMirror_table]:w-full',
                '[&_.ProseMirror_td]:border',
                '[&_.ProseMirror_td]:border-gray-300',
                '[&_.ProseMirror_td]:p-2',
                '[&_.ProseMirror_th]:border',
                '[&_.ProseMirror_th]:border-gray-300',
                '[&_.ProseMirror_th]:p-2',
                '[&_.ProseMirror_th]:bg-gray-50',
                '[&_.ProseMirror_th]:font-semibold',
                '[&_.selectedCell]:bg-blue-50',
            ].join(' ') }))));
}
