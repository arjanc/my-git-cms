'use client';
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;
export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (React.createElement(DialogPrimitive.Overlay, { ref: ref, className: cn('fixed inset-0 z-50 bg-black/50', className), ...props })));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
export const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (React.createElement(DialogPortal, null,
    React.createElement(DialogOverlay, null),
    React.createElement(DialogPrimitive.Content, { ref: ref, className: cn('git-cms fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg sm:rounded-lg', className), ...props },
        children,
        React.createElement(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500" },
            React.createElement(X, { className: "h-4 w-4" }),
            React.createElement("span", { className: "sr-only" }, "Close"))))));
DialogContent.displayName = DialogPrimitive.Content.displayName;
export function DialogHeader({ className, ...props }) {
    return (React.createElement("div", { className: cn('flex flex-col space-y-1.5 text-center sm:text-left', className), ...props }));
}
export function DialogFooter({ className, ...props }) {
    return (React.createElement("div", { className: cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className), ...props }));
}
export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (React.createElement(DialogPrimitive.Title, { ref: ref, className: cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className), ...props })));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
export const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (React.createElement(DialogPrimitive.Description, { ref: ref, className: cn('text-sm text-gray-500', className), ...props })));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
