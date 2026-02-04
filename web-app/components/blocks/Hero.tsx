import React from 'react';
import { HeroBlock } from '../../../shared/block-types';

interface HeroProps {
  block: HeroBlock;
}

export function Hero({ block }: HeroProps) {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700"
      style={{
        backgroundImage: block.backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${block.backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          {block.heading}
        </h1>
        
        {block.subheading && (
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
            {block.subheading}
          </p>
        )}
        
        {block.ctaText && block.ctaUrl && (
          <a
            href={block.ctaUrl}
            className="inline-block px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {block.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
