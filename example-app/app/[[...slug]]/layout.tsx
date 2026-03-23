import React from 'react';
import path from 'path';
import { buildNav } from '@git-cms/core/nav';
import { getSettings } from '@git-cms/core';
import { Navigation } from '../../components/navigation';
import { HeroBlock, BannerBlock, USPBlock, ImageBlock, TextBlock, LayoutBlock, HeadingBlock, ButtonBlock } from '../../components/blocks';
import type { BlockInstance } from '@git-cms/core';

function renderFooterBlock(block: BlockInstance): React.ReactNode {
  switch (block.type) {
    case 'hero':    return <HeroBlock key={block.id} block={block} />
    case 'banner':  return <BannerBlock key={block.id} block={block} />
    case 'usp':     return <USPBlock key={block.id} block={block} />
    case 'image':   return <ImageBlock key={block.id} block={block} />
    case 'text':    return <TextBlock key={block.id} block={block} />
    case 'layout':  return <LayoutBlock key={block.id} block={block} renderBlock={renderFooterBlock} />
    case 'heading': return <HeadingBlock key={block.id} block={block} />
    case 'button':  return <ButtonBlock key={block.id} block={block} />
    default:        return null
  }
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const nav = buildNav([
        path.join(process.cwd(), 'content', 'pages'),
        path.join(process.cwd(), 'content', 'about'),
    ]);

    const settings = getSettings(path.join(process.cwd(), 'content', 'settings.json'));
    const footerBlocks = settings.footerBlocks ?? [];

    return (
        <>
            <header>
                {nav.items.length > 0 && <Navigation nav={nav} />}
            </header>
            {children}
            {footerBlocks.length > 0 && (
                <footer>
                    {footerBlocks.map((block) => (
                        <div key={block.id} className="container mx-auto max-w-5xl px-4">
                            {renderFooterBlock(block)}
                        </div>
                    ))}
                </footer>
            )}
        </>
    );
}
