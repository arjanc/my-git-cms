"use client";

import React, { useState, useEffect } from 'react';
import { PageContent, Block, BlockType, createDefaultBlock, serializeToMarkdown, parseMarkdown, generateBlockId } from '@git-cms/shared';
import { BlockEditor } from './blocks/BlockEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Plus } from 'lucide-react';

interface PageEditorProps {
  initialContent?: string;
  onSave: (markdown: string, title: string) => Promise<void>;
  isSaving?: boolean;
}

export function PageEditor({ initialContent, onSave, isSaving }: PageEditorProps) {
  const [pageContent, setPageContent] = useState<PageContent>({
    title: 'New Page',
    slug: '/new-page',
    blocks: [],
  });

  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = parseMarkdown(initialContent);
        setPageContent(parsed);
      } catch (error) {
        console.error('Error parsing markdown:', error);
      }
    }
  }, [initialContent]);

  const handleMetadataChange = (field: keyof PageContent, value: any) => {
    setPageContent({ ...pageContent, [field]: value });
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createDefaultBlock(type, generateBlockId());
    setPageContent({
      ...pageContent,
      blocks: [...pageContent.blocks, newBlock],
    });
  };

  const handleBlockChange = (index: number, updatedBlock: Block) => {
    const newBlocks = [...pageContent.blocks];
    newBlocks[index] = updatedBlock;
    setPageContent({ ...pageContent, blocks: newBlocks });
  };

  const handleBlockDelete = (index: number) => {
    const newBlocks = pageContent.blocks.filter((_, i) => i !== index);
    setPageContent({ ...pageContent, blocks: newBlocks });
  };

  const handleBlockMove = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...pageContent.blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newBlocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      setPageContent({ ...pageContent, blocks: newBlocks });
    }
  };

  const handleSave = async () => {
    const markdown = serializeToMarkdown(pageContent);
    await onSave(markdown, pageContent.title);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Page Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Page Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={pageContent.title}
              onChange={(e) => handleMetadataChange('title', e.target.value)}
              placeholder="Page title"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={pageContent.slug}
              onChange={(e) => handleMetadataChange('slug', e.target.value)}
              placeholder="/about"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={pageContent.description || ''}
              onChange={(e) => handleMetadataChange('description', e.target.value)}
              placeholder="Page description for SEO"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Block Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Block</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('hero')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Hero
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('banner')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Banner
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('usp')}
            >
              <Plus className="w-4 h-4 mr-1" />
              USP
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('video')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Video
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('image')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('text')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Text
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocks */}
      <div className="space-y-4">
        {pageContent.blocks.map((block, index) => (
          <BlockEditor
            key={block.id}
            block={block}
            onChange={(updatedBlock) => handleBlockChange(index, updatedBlock)}
            onDelete={() => handleBlockDelete(index)}
            onMoveUp={index > 0 ? () => handleBlockMove(index, 'up') : undefined}
            onMoveDown={
              index < pageContent.blocks.length - 1
                ? () => handleBlockMove(index, 'down')
                : undefined
            }
          />
        ))}
      </div>

      {pageContent.blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No blocks yet. Add a block to get started!</p>
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Page'}
        </Button>
      </div>
    </div>
  );
}
