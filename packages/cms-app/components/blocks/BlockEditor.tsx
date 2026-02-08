import React from 'react';
import { Block } from '@git-cms/shared';
import { HeroBlockEditor } from './editors/HeroBlockEditor';
import { USPBlockEditor } from './editors/USPBlockEditor';
// Import other block editors as you create them

interface BlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown }: BlockEditorProps) {
  const renderEditor = () => {
    switch (block.type) {
      case 'hero':
        return <HeroBlockEditor block={block} onChange={onChange} />;
      case 'usp':
        return <USPBlockEditor block={block} onChange={onChange} />;
      // Add other block types here
      default:
        return (
          <div className="p-4 border rounded bg-muted">
            <p className="text-sm text-muted-foreground">
              Editor for "{block.type}" block not yet implemented
            </p>
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveUp && (
          <button
            onClick={onMoveUp}
            className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50"
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
        {onMoveDown && (
          <button
            onClick={onMoveDown}
            className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50"
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1 bg-white border rounded shadow-sm hover:bg-red-50 text-red-600"
          title="Delete block"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {renderEditor()}
    </div>
  );
}
