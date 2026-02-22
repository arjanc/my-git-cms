import React from 'react';
import { signIn } from '../auth';
export default function SignInPage() {
    return (React.createElement("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center" },
        React.createElement("div", { className: "bg-white p-8 rounded-lg shadow text-center space-y-4" },
            React.createElement("h1", { className: "text-2xl font-bold" }, "Sign in to Git CMS"),
            React.createElement("form", { action: async () => {
                    'use server';
                    await signIn('github', { redirectTo: '/admin' });
                } },
                React.createElement("button", { type: "submit", className: "px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700" }, "Sign in with GitHub")))));
}
