'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { NavRendererProps } from '@git-cms/core'
import { NavigationItem } from './NavigationItem'

export function Navigation({ nav }: Omit<NavRendererProps, 'currentPath'>) {
    const currentPath = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="relative bg-white z-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center border-b-2 border-neutral-100 py-6 md:justify-start md:space-x-10">

                    {/* Logo */}
                    <div className="lg:w-0 lg:flex-1">
                        <a href="/" className="flex items-center no-underline">
                            <span className="text-xl font-bold text-primary-600 tracking-tight">My Site</span>
                        </a>
                    </div>

                    {/* Mobile hamburger button */}
                    <div className="-mr-2 -my-2 md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100 focus:text-neutral-500 transition duration-150 ease-in-out"
                            aria-label="Open menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex space-x-10">
                        {nav.items.map((item) => (
                            <NavigationItem key={item.href} item={item} currentPath={currentPath} />
                        ))}
                    </nav>

                    {/* Desktop right side — reserved for CTAs */}
                    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0" />
                </div>
            </div>

            {/* ── Mobile menu backdrop ────────────────────────────────────────────── */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Mobile menu panel ───────────────────────────────────────────────── */}
            <div
                className={`absolute top-0 inset-x-0 p-2 z-50 md:hidden transition transform origin-top-right duration-200 ${mobileMenuOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <div className="rounded-lg shadow-lg">
                    <div className="rounded-lg shadow-sm bg-white divide-y-2 divide-neutral-50">

                        {/* Mobile panel header */}
                        <div className="pt-5 pb-6 px-5 space-y-6">
                            <div className="flex items-center justify-between">
                                <a href="/" className="no-underline">
                                    <span className="text-xl font-bold text-primary-600 tracking-tight">My Site</span>
                                </a>
                                <div className="-mr-2">
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        type="button"
                                        className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none transition duration-150 ease-in-out"
                                        aria-label="Close menu"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Items with children — shown as a flat list of their children */}
                            {nav.items.some((item) => item.children && item.children.length > 0) && (
                                <nav className="grid gap-y-6">
                                    {nav.items
                                        .filter((item) => item.children && item.children.length > 0)
                                        .flatMap((item) => item.children!)
                                        .map((child) => (
                                            <a
                                                key={child.href}
                                                href={child.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`-m-3 p-3 flex items-center space-x-3 rounded-md hover:bg-neutral-50 transition ease-in-out duration-150 no-underline ${currentPath === child.href ? 'text-primary-600' : 'text-neutral-900'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-primary-600 text-white text-sm font-bold">
                                                    {child.title.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-base font-medium">{child.title}</span>
                                            </a>
                                        ))}
                                </nav>
                            )}
                        </div>

                        {/* All top-level items as a 2-column grid */}
                        <div className="py-6 px-5 space-y-6">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                {nav.items.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-base font-medium hover:text-neutral-700 transition ease-in-out duration-150 no-underline ${currentPath === item.href ? 'text-primary-600' : 'text-neutral-900'
                                            }`}
                                    >
                                        {item.title}
                                    </a>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
