'use client';
// Classic JSX transform is active ("jsx": "react") so React must be imported.
import React, { Suspense } from 'react';
// React.lazy defers the Tiptap/ProseMirror import until first client render,
// preventing window/document access during SSR in Next.js App Router.
// This file must not import from 'next/*' — the package is framework-agnostic.
const TiptapEditor = React.lazy(() => import('./TiptapEditor').then((mod) => ({ default: mod.TiptapEditor })));
export function RichTextEditor({ value, onChange }) {
    return (React.createElement(Suspense, { fallback: React.createElement("div", { className: "w-full h-48 border rounded bg-gray-50 animate-pulse" }) },
        React.createElement(TiptapEditor, { value: value, onChange: onChange })));
}
