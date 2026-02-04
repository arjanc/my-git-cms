import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseMarkdown } from '@git-cms/shared';
import { BlockRenderer } from '../../components/blocks/BlockRenderer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        slug?: string[];
    }>;
}

async function getPageContent(slugArray: string[] | undefined) {
    const contentDir = join(process.cwd(), '../content', 'pages');

    try {
        const files = readdirSync(contentDir);
        const requestedSlug = slugArray ? `/${slugArray.join('/')}` : '/';

        for (const file of files) {
            if (!file.endsWith('.md')) continue;

            const content = readFileSync(join(contentDir, file), 'utf-8');
            const page = parseMarkdown(content);

            if (page.slug === requestedSlug) {
                return page;
            }
        }
    } catch (error) {
        console.error('Error loading page:', error);
    }

    return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageContent(slug);

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    return {
        title: page.title,
        description: page.description,
    };
}

export async function generateStaticParams() {
    const contentDir = join(process.cwd(), '../content', 'pages');

    try {
        const files = readdirSync(contentDir);
        return files
            .filter((file) => file.endsWith('.md'))
            .map((file) => {
                const content = readFileSync(join(contentDir, file), 'utf-8');
                const page = parseMarkdown(content);

                // Handle both root and nested paths
                // Note: For catch-all [[...slug]], root is represented as explicit undefined or empty array in some contexts,
                // but generateStaticParams expects the params object.
                const slug = page.slug === '/' ? [] : page.slug.split('/').filter(Boolean);

                return {
                    slug,
                };
            });
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function PAGE({ params }: PageProps) {
    const { slug } = await params;
    const page = await getPageContent(slug);

    if (!page) {
        notFound();
    }

    return (
        <main>
            {page.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
        </main>
    );
}
