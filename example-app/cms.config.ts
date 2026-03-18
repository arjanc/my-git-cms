import type { BlockSchema, PageSchema } from '@git-cms/core'

export const blockSchemas: BlockSchema[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    fields: [
      { name: 'heading', label: 'Heading', fieldType: 'text', required: true, defaultValue: 'Welcome' },
      { name: 'subheading', label: 'Subheading', fieldType: 'textarea', defaultValue: '' },
      { name: 'subheadingAttribution', label: 'Subheading Attribution', fieldType: 'text', defaultValue: '' },
      { name: 'ctaText', label: 'Button text', fieldType: 'text', defaultValue: 'Get started' },
      { name: 'ctaUrl', label: 'Button URL', fieldType: 'text', defaultValue: '/' },
      { name: 'backgroundImages', label: 'Background images', fieldType: 'imagelist', defaultValue: [] },
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
    type: 'heading',
    label: 'Heading',
    fields: [
      {
        name: 'tag',
        label: 'Tag',
        fieldType: 'dropdown',
        defaultValue: 'h2',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
        ],
      },
      { name: 'text', label: 'Text', fieldType: 'text', required: true, defaultValue: '' },
      {
        name: 'alignment',
        label: 'Alignment',
        fieldType: 'dropdown',
        defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
  },
  {
    type: 'text',
    label: 'Text / Rich Text',
    fields: [
      { name: 'content', label: 'Content', fieldType: 'richtext', required: true, defaultValue: '' },
    ],
  },
  {
    type: 'button',
    label: 'Button',
    fields: [
      { name: 'label', label: 'Button text', fieldType: 'text', required: true, defaultValue: 'Click here' },
      { name: 'url', label: 'URL', fieldType: 'pagepicker', required: true, defaultValue: '/', contentPath: 'example-app/content/pages' },
      {
        name: 'variant',
        label: 'Variant',
        fieldType: 'dropdown',
        defaultValue: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Clean', value: 'clean' },
        ],
      },
      {
        name: 'target',
        label: 'Open in',
        fieldType: 'dropdown',
        defaultValue: 'self',
        options: [
          { label: 'Same tab', value: 'self' },
          { label: 'New tab', value: 'blank' },
        ],
      },
      {
        name: 'size',
        label: 'Size',
        fieldType: 'dropdown',
        defaultValue: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
      },
      {
        name: 'alignment',
        label: 'Alignment',
        fieldType: 'dropdown',
        defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
  },
  {
    type: 'layout',
    label: 'Layout (columns)',
    fields: [
      {
        name: 'columns',
        label: 'Number of columns',
        fieldType: 'dropdown',
        defaultValue: '2',
        options: [
          { label: '2 columns', value: '2' },
          { label: '3 columns', value: '3' },
          { label: '4 columns', value: '4' },
        ],
      },
    ],
    columnsConfig: {
      // Remove 'layout' to prevent nesting; list specific types to restrict
      allowedBlocks: ['text', 'image', 'banner', 'usp', 'button'],
    },
  },
]

/**
 * Subdirectory within the git repo where this Next.js app lives.
 * All PageSchema contentPath values are relative to this base.
 *
 * Change to '' (empty string) if this app is at the repo root.
 */
export const contentBase = 'example-app'

export const pageSchemas: PageSchema[] = [
  {
    type: 'pages',
    label: 'Pages',
    allowedBlocks: 'any',
    contentPath: 'content/pages',
  },
  {
    type: 'about',
    label: 'About',
    allowedBlocks: 'any',
    contentPath: 'content/about',
  },
]
