// Constants
//
const HTML_5_TAGS = new Set([
    "a", "abbr", "address", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote",
    "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data",
    "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset",
    "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header",
    "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li",
    "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup",
    "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp",
    "script", "section", "select", "slot", "small", "source", "span", "strong", "style", "sub", "summary",
    "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title",
    "tr", "track", "u", "ul", "var", "video", "wbr"
]);

// Exports
//
export function isHtml5Tag(tagName: string): boolean {
    return HTML_5_TAGS.has(tagName.toLowerCase());
}

export async function importDynamic(filePath: string): Promise<any> {

    // Specify the path for the temporary module
    const tempFilePath = "./tempDynamicModule.ts";

    const dynamicModuleContent = await Deno.readTextFile(filePath);

    const example = `
    ---
    import Layout from "./components/layout.sqirrel";
    const { title } = Squirrel.props;
    const count = signal(0);
    ---
    <Layout>
        <h2>${title}</h2>
        <div>Count: ${count.value}</div>
    </Layout>
    `
    // Write the dynamic content to a file
    await Deno.writeTextFile(tempFilePath, dynamicModuleContent);

    // Dynamically import the newly created module
    const dynamicModule = await import(tempFilePath);

    await Deno.remove(tempFilePath);

    return dynamicModule;
}

export function transformHtml(mapping: any, html: string): string {
    console.log("mapping", mapping);
    console.log("html", html);

    return html + "<DIV>HELLOOOOOO</DIV>";
}
