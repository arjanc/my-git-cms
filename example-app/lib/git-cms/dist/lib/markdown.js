import matter from 'gray-matter';
export function serializeToMarkdown(content) {
    const raw = {
        title: content.title,
        slug: content.slug,
        description: content.description,
        pageSchema: content.pageSchema,
        blocks: content.blocks,
        metadata: content.metadata,
    };
    // js-yaml cannot serialize undefined — drop any key whose value is undefined
    const frontmatter = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
    return matter.stringify('', frontmatter);
}
export function parseMarkdown(markdown) {
    const { data } = matter(markdown);
    return {
        title: data.title || 'Untitled',
        slug: data.slug || '/',
        description: data.description,
        pageSchema: data.pageSchema,
        blocks: data.blocks || [],
        metadata: data.metadata
    };
}
export function validateBlock(block) {
    if (!block || typeof block !== 'object')
        return false;
    const b = block;
    return typeof b.id === 'string' && typeof b.type === 'string';
}
export function generateBlockId() {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
