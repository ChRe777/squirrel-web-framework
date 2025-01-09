// Imports
//
// @ts-ignore:
import { lookup } from "https://deno.land/x/mime_types@1.0.0/mod.ts";
// @ts-ignore:
import { join } from 'https://deno.land/std/path/mod.ts';
// Lib
import { makePage } from "./lib/page.ts";
import { makeContext } from './lib/utils.ts';
import { fileExists } from "./lib/utils.ts";
// Constants
import * as Constants from "./lib/constants.ts"

// config.ts
// const config = await import('./config.json', { with: { type: 'json' } });

function getContentType(fileName: string): false | string {
    return lookup(fileName);  // Looks up MIME type by file extension
}

/*
function makeSquirrel(path: string, context: Record<string, any>): string | null {
    console.log(Constants);

    const filepath = join(Constants.COMPONENTS_DIR, path);

    console.log(filepath);

    const result = parseFrontmatter(filepath);
    if (result == null) {
        return null // TODO: return error
    }

    const template = `
    const Squirrel = ${context};
    import { render, html } from 'https://cdn.jsdelivr.net/npm/uhtml/preactive.js';
    ${result.frontmatter}
    render(document.getElementById(id), () => html\`
        ${result.body}
    \`);`

    return template;
}
*/

async function serverFiles(path: string, context: Record<string, any>) {

    if (path === "/") {
        path = "/index_3.page"
    }

    if (path.endsWith(".page")) {
        const [squirrel, error] = await makePage(path, context);
        if (error != null) {
            console.log(error);
            return new Response(null, { status: 500 });
        }
        else if (squirrel == null) {
            return new Response(null, { status: 404 });
        } else {
            return new Response(squirrel, {
                status: 200,
                headers: {
                    "Content-Type": "text/html",
                }
            });
        }
    }


    try {

        // Check if file NOT exists -> 404
        //
        const filepath = join(Constants.PUBLIC_DIR, path);
        if (await fileExists(filepath) == false) {
            return new Response(null, { status: 404 });
        }

        // If exists --> 200
        //
        // @ts-ignore:
        const file = await Deno.readTextFile(filepath);
        return new Response(file, {
            status: 200,
            headers: {
                "Content-Type": getContentType(path) || Constants.DEFAULT_CONTENT_TYPE,
            },
        });

    } catch {
        return new Response(null, { status: 500 });
    }
}

// Default Entry
//
export default {
    async fetch(request: Request) {
        const url = new URL(request.url);
        const context = makeContext(request);
        return await serverFiles(url.pathname, context)
    },
};

// > deno serve --allow-read --allow-write --allow-net server.ts
