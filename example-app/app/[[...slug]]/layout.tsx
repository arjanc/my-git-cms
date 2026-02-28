import path from 'path';
import { getNav } from '@git-cms/core/nav';
import { Nav } from '../../components/Nav';


export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const nav = getNav(path.join(process.cwd(), 'content', 'nav.json'));

    return (
        <>
            <header>
                {nav.items.length > 0 && <Nav nav={nav} />}
            </header>
            {children}
        </>
    );
}
