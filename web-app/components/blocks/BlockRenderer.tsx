import React from 'react';
import { Block } from '../../../shared/block-types';
import { Hero } from './Hero';
import { USP } from './USP';

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'hero':
      return <Hero block={block} />;
    case 'usp':
      return <USP block={block} />;
    // Add other block renderers here as you create them
    case 'banner':
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-blue-900">{(block as any).text}</p>
        </div>
      );
    case 'video':
      return (
        <div className="aspect-video">
          <iframe
            src={(block as any).url}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );
    case 'image':
      return (
        <div className="my-8">
          <img
            src={(block as any).url}
            alt={(block as any).alt}
            className="w-full h-auto"
          />
          {(block as any).caption && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {(block as any).caption}
            </p>
          )}
        </div>
      );
    case 'text':
      return (
        <div className="prose max-w-none my-8">
          <p>{(block as any).content}</p>
        </div>
      );
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return null;
  }
}
