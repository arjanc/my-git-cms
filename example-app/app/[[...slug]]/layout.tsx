import path from 'path';
import { buildNav } from '@git-cms/core/nav';
import { Nav } from '../../components/Nav';


export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const nav = buildNav([
        path.join(process.cwd(), 'content', 'pages'),
        path.join(process.cwd(), 'content', 'blog'),
    ]);

    console.log('nav: ', nav);

    return (
        <>
            <header>
                {nav.items.length > 0 && <Nav nav={nav} />}
            </header>
            {children}
        </>
    );
}
