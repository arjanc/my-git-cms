'use client'

import { useState, useRef, useEffect } from 'react'
import type { NavItem } from '@git-cms/core'

interface NavigationItemProps {
  item: NavItem
  currentPath: string
}

export function NavigationItem({ item, currentPath }: NavigationItemProps) {
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isActive =
    currentPath === item.href ||
    (item.children?.some((c) => currentPath === c.href) ?? false)

  // Close flyout when clicking outside the component
  useEffect(() => {
    if (!flyoutOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFlyoutOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [flyoutOpen])

  // ── Simple link (no children) ──────────────────────────────────────────────
  if (!item.children || item.children.length === 0) {
    return (
      <a
        href={item.href}
        className={`text-base leading-6 font-medium hover:text-neutral-900 focus:outline-none focus:text-neutral-900 transition ease-in-out duration-150 no-underline ${
          isActive ? 'text-primary-600' : 'text-neutral-500'
        }`}
      >
        {item.title}
      </a>
    )
  }

  // ── Flyout dropdown (has children) ────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setFlyoutOpen((o) => !o)}
        className={`group inline-flex items-center space-x-1 text-base leading-6 font-medium hover:text-neutral-900 focus:outline-none focus:text-neutral-900 transition ease-in-out duration-150 ${
          flyoutOpen || isActive ? 'text-neutral-900' : 'text-neutral-500'
        }`}
      >
        <span>{item.title}</span>
        {/* Chevron rotates when open */}
        <svg
          className={`h-5 w-5 transition-transform ease-in-out duration-150 ${
            flyoutOpen
              ? 'rotate-180 text-neutral-600'
              : 'rotate-0 text-neutral-400 group-hover:text-neutral-500'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* ── Flyout panel ──────────────────────────────────────────────────── */}
      <div
        className={`absolute -ml-4 mt-3 transform px-2 w-screen max-w-xs sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 transition ease-out duration-200 ${
          flyoutOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <div className="rounded-lg shadow-lg overflow-hidden">
          {/* Child items */}
          <div className="relative grid gap-1 bg-white px-5 py-6 sm:gap-2 sm:p-6">
            {item.children.map((child) => {
              const childActive = currentPath === child.href
              return (
                <a
                  key={child.href}
                  href={child.href}
                  onClick={() => setFlyoutOpen(false)}
                  className="-m-3 p-3 flex items-start space-x-4 rounded-lg hover:bg-neutral-50 transition ease-in-out duration-150 no-underline group"
                >
                  {/* Letter badge — replaces the icons in the original */}
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary-600 text-white text-sm font-bold">
                    {child.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p
                      className={`text-base leading-6 font-medium ${
                        childActive ? 'text-primary-600' : 'text-neutral-900 group-hover:text-primary-600'
                      } transition-colors duration-150`}
                    >
                      {child.title}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>

          {/* Footer strip — link to parent page if it has its own href */}
          {item.href && item.href !== '#' && (
            <div className="px-5 py-4 bg-neutral-50 sm:px-6">
              <div className="flow-root">
                <a
                  href={item.href}
                  onClick={() => setFlyoutOpen(false)}
                  className="-m-3 p-3 flex items-center space-x-3 rounded-md text-base leading-6 font-medium text-neutral-900 hover:bg-neutral-100 transition ease-in-out duration-150 no-underline"
                >
                  <span>View all {item.title}</span>
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
