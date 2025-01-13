// Imports
//
import { parseFrontmatter } from "./mod.ts";
import { mapCustomTags } from "./mod.ts";
import { Data } from "../types/mod.ts";

/**
 * Make dynamic code
 * @param data
 * @param context
 * @returns
 */
function makeDynamicCode(data: Data, context: Record<string, any>) {
    const source = `

/* */
const Squirrel = ${JSON.stringify(context)};
const customTags_ = {};
/* */
${data.code}
/* */
const html_ = \`${data.template}\`;
/* */
if (Object.keys(customTags_).length == 0) {
    return [html_, null];
}
return mapCustomTags(customTags_, html_, Squirrel);
`;
    return source;
}

/**
 * @param dynamicCode
 * @returns
 */
async function evaluateAndReturn(dynamicCode: string): Promise<[string, any]> {
    const fnBody = `
    return async () => {
        ${dynamicCode}
    }`;

    const fn = new Function("mapCustomTags", fnBody);
    const asyncFn = fn(mapCustomTags); // Evaluate the code and return the result
    return await asyncFn();
}

/**
 * Eval body
 * @param data
 * @param context
 * @returns
 */
async function evalBody(
    data: Data,
    context: Record<string, any>,
): Promise<[string, any]> {
    try {
        const dynamicCode = makeDynamicCode(data, context);
        const [result, error] = await evaluateAndReturn(dynamicCode);
        return [result.trim(), error];
    } catch (error) {
        return ["", error];
    }
}

/**
*
    Transpile import like following example:

    import { Foo } from "./test/foo.squirrel";
    import { User } from "./test/user.uhtml";

    --->

    customTags["Foo"] = "./test/foo.squirrel";
    customTags["User"] = "./foo/user.squirrel";

* @param code
* @returns transpile code
*/
export function transpileImports(code: string): string {
    const regex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)(.squirrel|.uhtml)["']\s*[;]*/g;

    const result = code.replace(regex, (_, moduleNames, path, ending) => {
        // Split the module names in case there are multiple (e.g., { Foo, Bar })
        const modules = moduleNames.split(",").map((name: string) => name.trim());
        // Create the customTags assignments for each module
        return modules.map((moduleName: string) =>
            `customTags_["${moduleName}"] = "${path}${ending}";`
        ).join("\n");
    });

    return result;
}

/**
 * Transpile content of frontmatter to html
 * @param content
 * @param context
 * @returns
 */
export async function transpile(
    content: string,
    context: Record<string, any>,
): Promise<[string, any]> {
    //
    // ---
    // {code}
    // ---
    // {body}
    //
    const data = parseFrontmatter(content.trim())!;
    const { frontmatter, body } = data;

    // import { User } from "./components/user.squirrel"
    // import { Button } from "./components/button.uhtml"
    //
    const code = transpileImports(frontmatter);

    // 3. Eval code and template
    //
    const data_ = {
        code: code,
        template: body,
    };

    const [html, error] = await evalBody(data_, context);
    return [html, error];
}
