'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
export function Dashboard({ onNavigate, pageSchemas, onSelectSchema }) {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Dashboard"),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Manage your site content")),
        React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" },
            pageSchemas && pageSchemas.length > 0 ? (pageSchemas.map((schema) => (React.createElement("button", { key: schema.type, onClick: () => onSelectSchema?.(schema.type), className: "text-left group" },
                React.createElement(Card, { className: "h-full hover:shadow-md transition-shadow cursor-pointer" },
                    React.createElement(CardHeader, null,
                        React.createElement(CardTitle, { className: "group-hover:text-blue-600 transition-colors" }, schema.label),
                        React.createElement(CardDescription, { className: "font-mono text-xs mt-1" }, schema.contentPath))))))) : (React.createElement("button", { onClick: () => onNavigate('files'), className: "text-left group" },
                React.createElement(Card, { className: "h-full hover:shadow-md transition-shadow cursor-pointer" },
                    React.createElement(CardHeader, null,
                        React.createElement(CardTitle, { className: "group-hover:text-blue-600 transition-colors" }, "Manage Pages"),
                        React.createElement(CardDescription, null, "Create, edit, and delete your content pages"))))),
            React.createElement(Card, null,
                React.createElement(CardHeader, null,
                    React.createElement(CardTitle, null, "Repository"),
                    React.createElement(CardDescription, null, "Content stored in your GitHub repository")),
                React.createElement(CardContent, null,
                    React.createElement("p", { className: "text-xs text-gray-400" }, "Connected via GitHub API"))))));
}
