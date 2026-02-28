import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import path from 'path';
import { getNav } from '@git-cms/core/nav';
import { Nav } from '../components/Nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Git CMS Web App',
    description: 'Built with Next.js and Git CMS',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const nav = getNav(path.join(process.cwd(), 'content', 'nav.json'));

    return (
        <html lang="en">
            <body className={inter.className}>
                {nav.items.length > 0 && <Nav nav={nav} />}
                {children}
            </body>
        </html>
    );
}
