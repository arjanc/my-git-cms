'use client'

import { usePathname } from 'next/navigation'
import type { NavRendererProps } from '@git-cms/core'
import { NavigationItem } from './NavigationItem'

export function Navigation({ nav }: Omit<NavRendererProps, 'currentPath'>) {
    const currentPath = usePathname()

    return (
        <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ul className="list-none flex items-center gap-6 h-16 mb-0">
                    {nav.items.map((item) => {
                        return <NavigationItem key={item.href} item={item} currentPath={currentPath} />
                    })}
                </ul>
            </div>
        </nav>
    )
}
