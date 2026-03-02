'use client'

import { usePathname } from 'next/navigation'
import type { NavRendererProps } from '@git-cms/core'

export function Nav({ nav }: Omit<NavRendererProps, 'currentPath'>) {
  const currentPath = usePathname()

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-6 h-16">
          {nav.items.map((item) => {
            const isActive = currentPath === item.href
            return (
              <li key={item.href} className="relative group">
                <a
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  {item.title}
                </a>
                {item.children && item.children.length > 0 && (
                  <ul className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg py-1 min-w-40 z-10">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          className={`block px-4 py-2 text-sm hover:bg-neutral-50 ${
                            currentPath === child.href ? 'text-primary-600' : 'text-neutral-700'
                          }`}
                        >
                          {child.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
