import type { BlockSchema, PageSchema } from '@git-cms/core'

export const blockSchemas: BlockSchema[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    fields: [
      { name: 'heading', label: 'Heading', fieldType: 'text', required: true, defaultValue: 'Welcome' },
      { name: 'subheading', label: 'Subheading', fieldType: 'textarea', defaultValue: '' },
      { name: 'ctaText', label: 'Button text', fieldType: 'text', defaultValue: 'Get started' },
      { name: 'ctaUrl', label: 'Button URL', fieldType: 'text', defaultValue: '/' },
      { name: 'backgroundImage', label: 'Background image URL', fieldType: 'image', defaultValue: '' },
    ],
  },
  {
    type: 'banner',
    label: 'Banner',
    fields: [
      { name: 'text', label: 'Message', fieldType: 'text', required: true, defaultValue: '' },
      {
        name: 'variant',
        label: 'Variant',
        fieldType: 'dropdown',
        defaultValue: 'info',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Warning', value: 'warning' },
          { label: 'Success', value: 'success' },
        ],
      },
    ],
  },
  {
    type: 'usp',
    label: 'USP Section',
    fields: [
      { name: 'title', label: 'Section title', fieldType: 'text', defaultValue: 'Why choose us' },
      { name: 'item1Title', label: 'Item 1 title', fieldType: 'text', defaultValue: '' },
      { name: 'item1Description', label: 'Item 1 description', fieldType: 'textarea', defaultValue: '' },
      { name: 'item2Title', label: 'Item 2 title', fieldType: 'text', defaultValue: '' },
      { name: 'item2Description', label: 'Item 2 description', fieldType: 'textarea', defaultValue: '' },
      { name: 'item3Title', label: 'Item 3 title', fieldType: 'text', defaultValue: '' },
      { name: 'item3Description', label: 'Item 3 description', fieldType: 'textarea', defaultValue: '' },
    ],
  },
  {
    type: 'image',
    label: 'Image',
    fields: [
      { name: 'url', label: 'Image URL', fieldType: 'image', required: true, defaultValue: '' },
      { name: 'alt', label: 'Alt text', fieldType: 'text', required: true, defaultValue: '' },
      { name: 'caption', label: 'Caption', fieldType: 'textarea', defaultValue: '' },
    ],
  },
  {
    type: 'text',
    label: 'Text / Rich Text',
    fields: [
      { name: 'content', label: 'Content', fieldType: 'richtext', required: true, defaultValue: '' },
    ],
  },
]

export const pageSchemas: PageSchema[] = [
  {
    type: 'pages',
    label: 'Pages',
    allowedBlocks: 'any',
    contentPath: 'content/pages',
  },
  {
    type: 'blog',
    label: 'Blog posts',
    allowedBlocks: ['text', 'image'],
    contentPath: 'content/blog',
  },
]
