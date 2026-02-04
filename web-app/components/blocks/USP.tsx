import React from 'react';
import { USPBlock } from '../../../shared/block-types';

interface USPProps {
  block: USPBlock;
}

export function USP({ block }: USPProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            {block.title}
          </h2>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {item.icon && (
                <div className="text-4xl mb-4">
                  {item.icon}
                </div>
              )}
              
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                {item.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
