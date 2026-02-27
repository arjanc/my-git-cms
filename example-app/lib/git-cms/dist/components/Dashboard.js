'use client';
import React from 'react';
export function Dashboard({ onNavigate, basePath }) {
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("h2", { className: "text-3xl font-bold" }, "Dashboard"),
        React.createElement("div", { className: "grid md:grid-cols-2 gap-4" },
            React.createElement("button", { onClick: () => onNavigate('files'), className: "p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left" },
                React.createElement("h3", { className: "text-xl font-semibold mb-2" }, "Manage Pages"),
                React.createElement("p", { className: "text-gray-600" }, "Create, edit, and delete your content pages")),
            React.createElement("div", { className: "p-6 bg-white rounded-lg shadow" },
                React.createElement("h3", { className: "text-xl font-semibold mb-2" }, "Repository Info"),
                React.createElement("p", { className: "text-gray-600" }, "Content stored in your GitHub repository")))));
}
