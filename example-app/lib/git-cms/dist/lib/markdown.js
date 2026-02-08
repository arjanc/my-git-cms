import matter from 'gray-matter';
export function serializeToMarkdown(content) {
    const frontmatter = {
        title: content.title,
        slug: content.slug,
        description: content.description,
        blocks: content.blocks,
        metadata: content.metadata,
    };
    const md = matter.stringify('', frontmatter);
    return md;
}
export function parseMarkdown(markdown) {
    const { data } = matter(markdown);
    return {
        title: data.title || 'Untitled',
        slug: data.slug || '/',
        description: data.description,
        blocks: data.blocks || [],
        metadata: data.metadata,
    };
}
export function validateBlock(block) {
    if (!block || typeof block !== 'object')
        return false;
    if (!block.id || !block.type)
        return false;
    return true;
}
export function generateBlockId() {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
