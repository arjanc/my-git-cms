export function NavigationItem({ item, currentPath }: { item: NavItem, currentPath: string }) {
    const isActive = currentPath === item.href
    return (
        <li key={item.href} className="relative group m-0">
            <a
                href={item.href}
                className={`inline-block p-2 rounded-xl text-sm font-medium transition-colors no-underline outline-none focus:bg-primary-500 focus:text-white ${isActive ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
            >
                {item.title}
            </a>
            {item.children && item.children.length > 0 && (
                <ul className="list-none m-0 p-0 absolute top-full left-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg min-w-40 z-10">
                    {item.children.map((child) => (
                        <NavigationItem key={child.href} item={child} currentPath={currentPath} />
                    ))}
                </ul>
            )}
        </li>
    )
}