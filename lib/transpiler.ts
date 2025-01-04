import { parseFrontmatter } from "./frontmatter.ts";

interface Data {
    code: string;
    html: string;
}

async function evalBody(data: Data): Promise<string> {

    const source = `
    return async function() {
        // Imports
        //
        const { mapCustomTags } = await import('./mapper.ts');
        // Constants
        //
        const customTags = {};
        //
        ${data.code}
        //
        const html_ = \`${data.html}\`;
        if (Object.keys(customTags).length) {
            return mapCustomTags(customTags, html_);
        }

        return html_;
    }`;

    const fn = new Function(source);
    const foo = fn();
    return await foo();
}

export function transpileImports(inputCode: string): string {
    // Regular expression to match `import <name> from '<path>'`
    //
    const importRegex = /import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"];/g;

    // Replace `import` statements with dynamic `import()`
    //
    /*
    const transformedCode = inputCode.replace(importRegex, (match, moduleName, modulePath) => {
        return `
        //const ${moduleName} = await importDynamic("${modulePath}");
        customTags["${moduleName}"] = ${modulePath};`;
    });
    */

    const transformedCode = inputCode.replace(importRegex, (match, moduleName, modulePath) => {
        return `customTags["${moduleName}"] = "${modulePath}";`;
    });

    return transformedCode;
}

export async function transpile(content: string, context: any = {}): Promise<string> {

    const result = parseFrontmatter(content.trim());
    // TODO: error
    if (result) {
        const { frontmatter, body } = result;

        // 0. Inject Context object
        //
        let code = frontmatter;
        code = `
            // Injected Context
            const Squirrel = ${JSON.stringify(context)};
            // Code
            ${code}`

        // 1. Transform Imports
        //
        code = transpileImports(code);

        // 2. Eval body
        //
        const html = await evalBody({ code: code, html: body })
        console.log("html", html);
        return html.trim();
    }
    // TODO
    return ""
}
