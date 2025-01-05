import { parseFrontmatter } from "./frontmatter.ts";
// @ts-ignore
import { mapCustomTags } from "./mapper.ts";

import { Data } from "./types.ts"

function evaluateAndReturn(dynamicCode: string): string {
    // Inject fn mapCustomTags as 1. Parameter to Function
    const fn = new Function('mapCustomTags', dynamicCode);
    const result = fn(mapCustomTags); // Evaluate the code and return the result
    return result;
}

function makeDynamicCode(data: Data) {

    const source = `
// Constants
const customTags = {};
${data.code}

// Interpolate variables in html
let html_ = \`${data.html}\`;

// If custom tags exists transpile them
if (Object.keys(customTags).length) {
    const context = Squirrel;
    html_ = mapCustomTags(customTags, html_, context);
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

    /*
    const endings = "(.squirrel|.uthml)"
    const pattern = `import\\s+{([^}]+)}\\s+from\\s+["']([^"']+)(${endings})["']\\s`
    const flags = 'g';  // Global search
    const regex_ = new RegExp(pattern, flags);
    */

    /*
    import { Foo } from "./test/foo.squirrel";
    import { User } from "./test/user.uhtml";

    customTags["Foo"] = "./test/foo.squirrel";
    customTags["User"] = "./foo/user.squirrel";
    */

    const regex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)(.squirrel|.uhtml)["']\s*[;]*/g;

    const result = code.replace(regex, (match, moduleNames, path, ending) => {
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

    let code = frontmatter;

    // 0. Inject Context object
    //
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

    //console.log("code", code);

    const html = evalBody({ code: code, html: body })
    return html.trim();
}
