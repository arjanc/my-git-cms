// Block type definitions
export function createDefaultBlock(type, id) {
    const baseBlock = { id, type };
    switch (type) {
        case 'hero':
            return {
                ...baseBlock,
                type: 'hero',
                heading: 'New Hero Section',
                subheading: 'Add your subheading here',
            };
        case 'banner':
            return {
                ...baseBlock,
                type: 'banner',
                text: 'Important announcement',
                variant: 'info',
            };
        case 'usp':
            return {
                ...baseBlock,
                type: 'usp',
                title: 'Why Choose Us',
                items: [
                    { title: 'Fast', description: 'Lightning quick performance' },
                    { title: 'Secure', description: 'Enterprise-grade security' },
                    { title: 'Scalable', description: 'Grows with your needs' },
                ],
            };
        case 'video':
            return {
                ...baseBlock,
                type: 'video',
                url: '',
                title: 'Video Title',
            };
        case 'image':
            return {
                ...baseBlock,
                type: 'image',
                url: '',
                alt: 'Image description',
            };
        case 'text':
            return {
                ...baseBlock,
                type: 'text',
                content: 'Start writing your content here...',
                variant: 'prose',
            };
        default:
            throw new Error(`Unknown block type: ${type}`);
    }
}
