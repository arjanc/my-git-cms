import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseMarkdown } from '../../shared/markdown-utils';
import { PageContent } from '../../shared/block-types';
import { BlockRenderer } from '../components/blocks/BlockRenderer';

interface PageProps {
  page: PageContent;
}

export default function DynamicPage({ page }: PageProps) {
  return (
    <>
      <Head>
        <title>{page.title}</title>
        {page.description && <meta name="description" content={page.description} />}
      </Head>

      <main>
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentDir = join(process.cwd(), 'content', 'pages');
  
  try {
    const files = readdirSync(contentDir);
    const paths = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const content = readFileSync(join(contentDir, file), 'utf-8');
        const page = parseMarkdown(content);
        
        // Handle both root and nested paths
        const slug = page.slug === '/' ? [] : page.slug.split('/').filter(Boolean);
        
        return {
          params: { slug },
        };
      });

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const contentDir = join(process.cwd(), 'content', 'pages');
  
  try {
    const files = readdirSync(contentDir);
    
    // Find the markdown file matching the slug
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const content = readFileSync(join(contentDir, file), 'utf-8');
      const page = parseMarkdown(content);
      
      const slugArray = params?.slug as string[] | undefined;
      const requestedSlug = slugArray ? `/${slugArray.join('/')}` : '/';
      
      if (page.slug === requestedSlug) {
        return {
          props: {
            page,
          },
          revalidate: 60, // Revalidate every 60 seconds
        };
      }
    }
    
    return {
      notFound: true,
    };
  } catch (error) {
    console.error('Error loading page:', error);
    return {
      notFound: true,
    };
  }
};
