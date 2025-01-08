// Imports
//
import { parseFrontmatter } from "./frontmatter.ts";
import { mapCustomTags } from "./mapper.ts";
import { Data } from "./types.ts"

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

    // @ts-ignore
    //Deno.writeTextFileSync(`./source${i++}.txt`, source);

    return source
}

async function evaluateAndReturn(dynamicCode: string): Promise<string> {

    const fnBody = `
    return async () => {
        ${dynamicCode}
    }`

    const fn = new Function('mapCustomTags', fnBody);
    const asyncFn = fn(mapCustomTags); // Evaluate the code and return the result
    return await asyncFn();
}

async function evalBody(data: Data): Promise<string> {
    const dynamicCode = makeDynamicCode(data);

    // @ts-ignore
    //await Deno.writeTextFile(`./dynamicCode${i++}.txt`, dynamicCode);

    const result = await evaluateAndReturn(dynamicCode);
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

let i = 0;

export async function transpile(content: string, context: any = {}): Promise<string> {

    const data = parseFrontmatter(content.trim())!;
    const { frontmatter, body } = data;

    const buffer: string[] = [];
    let code = frontmatter;

    // 1. Inject context
    buffer.push(`const Squirrel = ${JSON.stringify(context)};`)
    // 2. Inject code
    buffer.push(code);
    // 3. Transpile imports
    code = transpileImports(buffer.join("\n"));

    const html = await evalBody({
        code: code,
        html: body
    });

    // @ts-ignore
    await Deno.writeTextFile(`./afterEvalBody${i++}.html`, html);

    return html.trim();
}
