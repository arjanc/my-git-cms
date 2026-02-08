import React from 'react';
import { USPBlock } from '@git-cms/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface USPBlockEditorProps {
  block: USPBlock;
  onChange: (block: USPBlock) => void;
}

export function USPBlockEditor({ block, onChange }: USPBlockEditorProps) {
  const handleChange = (field: keyof USPBlock, value: any) => {
    onChange({ ...block, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...block.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange('items', newItems);
  };

  const addItem = () => {
    const newItems = [...block.items, { title: '', description: '' }];
    handleChange('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = block.items.filter((_, i) => i !== index);
    handleChange('items', newItems);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">USP Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Section Title</Label>
          <Input
            id="title"
            value={block.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Why Choose Us"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button type="button" size="sm" onClick={addItem} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          {block.items.map((item, index) => (
            <Card key={index} className="border-dashed">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor={`item-title-${index}`}>Title</Label>
                      <Input
                        id={`item-title-${index}`}
                        value={item.title}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-desc-${index}`}>Description</Label>
                      <Textarea
                        id={`item-desc-${index}`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Feature description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-icon-${index}`}>Icon (optional)</Label>
                      <Input
                        id={`item-icon-${index}`}
                        value={item.icon || ''}
                        onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                        placeholder="icon-name or emoji"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
