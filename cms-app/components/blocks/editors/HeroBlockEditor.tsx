import React from 'react';
import { HeroBlock } from '@git-cms/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeroBlockEditorProps {
  block: HeroBlock;
  onChange: (block: HeroBlock) => void;
}

export function HeroBlockEditor({ block, onChange }: HeroBlockEditorProps) {
  const handleChange = (field: keyof HeroBlock, value: any) => {
    onChange({ ...block, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hero Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="heading">Heading</Label>
          <Input
            id="heading"
            value={block.heading}
            onChange={(e) => handleChange('heading', e.target.value)}
            placeholder="Main heading"
          />
        </div>

        <div>
          <Label htmlFor="subheading">Subheading</Label>
          <Textarea
            id="subheading"
            value={block.subheading || ''}
            onChange={(e) => handleChange('subheading', e.target.value)}
            placeholder="Supporting text"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ctaText">CTA Text</Label>
            <Input
              id="ctaText"
              value={block.ctaText || ''}
              onChange={(e) => handleChange('ctaText', e.target.value)}
              placeholder="Get Started"
            />
          </div>

          <div>
            <Label htmlFor="ctaUrl">CTA URL</Label>
            <Input
              id="ctaUrl"
              value={block.ctaUrl || ''}
              onChange={(e) => handleChange('ctaUrl', e.target.value)}
              placeholder="/signup"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="backgroundImage">Background Image URL</Label>
          <Input
            id="backgroundImage"
            value={block.backgroundImage || ''}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </CardContent>
    </Card>
  );
}
