// Exports
//
export function parseFrontmatter(content: string) {
    // @ts-ignore
    const frontmatterRegex = /^---\s*([\s\S]+?)\s*---/; // Matches the frontmatter block
    const match = content.match(frontmatterRegex);

    if (match) {
        // Extract frontmatter and body
        const frontmatter = match[1].trim();
        const body = content.substring(match[0].length).trim();

        return { frontmatter, body };
    } else {
        return null
    }
}
