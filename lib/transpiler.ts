import { parseFrontmatter } from "./frontmatter.ts";
// @ts-ignore
import { mapCustomTags } from "./mapper.ts";

import { Data } from "./types.ts"

function evaluateAndReturn(dynamicCode: string) {
    const fn = new Function('mapCustomTags', dynamicCode);
    return fn(mapCustomTags); // Evaluate the code and return the result
}

function makeDynamicCode(data: Data) {

    const source = `
// Constants
const customTags = {};
${data.code}

// Interpolate variables in html
let html_ = \`${data.html}\`;

// If Custom Tags map them
if (Object.keys(customTags).length) {
    const context = Squirrel;
    html_ = mapCustomTags(customTags, html_, context);
    console.log("html_", html_);
}

return html_;
`;
    return source
}

function evalBody(data: Data): string {
    const dynamicCode = makeDynamicCode(data);
    const result = evaluateAndReturn(dynamicCode);
    return result;
}

export function transpileImports(code: string): string {

    const ending = ".squirrel";

    const pattern = `import\\s+{([^}]+)}\\s+from\\s+["']([^"']+)${ending}["']\\s*;`
    const flags = 'g';  // Global search

    const regex = new RegExp(pattern, flags);

    const result = code.replace(regex, (match, moduleNames, path) => {
        // Split the module names in case there are multiple (e.g., { Foo, Bar })
        const modules = moduleNames.split(',').map((name: string) => name.trim());

        // Create the customTags assignments for each module
        return modules.map((moduleName: string) => `customTags["${moduleName}"] = "${path}${ending}";`).join('\n');
    });


    return result;
}

export function transpile(content: string, context: any = {}): string {

    const data = parseFrontmatter(content.trim())!;

    const { frontmatter, body } = data;

    // 0. Inject Context object
    //
    let code = frontmatter;
    code = `
// Injected Context
const Squirrel = ${JSON.stringify(context)};

// Code
${code}
`

    // 1. Transform Imports
    //
    code = transpileImports(code);

    // 2. Eval body
    //
    const html = evalBody({ code: code, html: body })
    return html.trim();
}
