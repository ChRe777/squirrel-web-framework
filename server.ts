// Imports
//
// @ts-ignore
import { join } from 'https://deno.land/std/path/mod.ts';
// @ts-ignore
import { lookup } from "https://deno.land/x/mime_types@1.0.0/mod.ts";
// Lib
import * as Constants from "./lib/constants.ts"
import { transpile } from './lib/transpiler.ts';

function getContentType(fileName: string): string | null {
    return lookup(fileName);  // Looks up MIME type by file extension
}

function parseFrontmatter(filePath: string) {
    // @ts-ignore
    const fileContent = Deno.readTextFileSync(filePath); // Read file content
    const frontmatterRegex = /^---\s*([\s\S]+?)\s*---/; // Matches the frontmatter block
    const match = fileContent.match(frontmatterRegex);

    if (match) {
        // Extract frontmatter and body
        const frontmatter = match[1].trim();
        const body = fileContent.substring(match[0].length).trim();

        return { frontmatter, body };
    } else {
        return null
    }
}

async function makePage(path: string) {
    const filepath = join(Constants.PAGES_DIR, path)

    // TODO: Fill content with url, site, cookies,...
    const context = {};

    // ---
    // import { User } from "./components/User.squirrel"
    // const id = 123;
    // ---
    // <User id=${id}></User>
    //
    const content = await Deno.readTextFile(filepath);

    const result = await transpile(content, context);
    return result;
}

function makeSquirrel(path: string): string | null {
    console.log(Constants);

    const filepath = join(Constants.COMPONENTS_DIR, path);

    console.log(filepath);

    const result = parseFrontmatter(filepath);
    if (result == null) {
        return null // TODO: return error
    }

    const template = `
    import { render, html } from 'https://cdn.jsdelivr.net/npm/uhtml/preactive.js';
    ${result.frontmatter}
    render(document.getElementById(id), () => html\`
        ${result.body}
    \`);`

    return template;
}

async function serverFiles(path: string) {

    //if (path === "/") {
    //    path = "/index.html"
    //}


    if (path === "/") {
        path = "/index_3.page"
    }

    /*
    if (path.endsWith(".page")) {
        let page = makePage(path)
        if (page == null) {
            return new Response(null, { status: 404 });
        } else {
            return new Response(page, {
                status: 200,
                headers: {
                    "Content-Type": "text/html",
                }
            });
        }
    }
    */

    console.log("path", path);

    if (path.endsWith(".page")) {
        let squirrel = await makePage(path);

        if (squirrel == null) {
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

    if (path.endsWith(".squirrel")) {
        let squirrel = makeSquirrel(path);

        if (squirrel == null) {
            return new Response(null, { status: 404 });
        } else {
            return new Response(squirrel, {
                status: 200,
                headers: {
                    "Content-Type": "application/javascript",
                }
            });
        }
    }

    const content_type = getContentType(path) || Constants.DEFAULT_CONTENT_TYPE;

    console.log(content_type, path);

    let file = null;

    try {
        const filepath = join(Constants.PUBLIC_DIR, path);
        // @ts-ignore
        file = Deno.readTextFileSync(filepath);
    } catch {
        return new Response(null, { status: 404 });
    }

    if (file) {
        return new Response(file, {
            status: 200,
            headers: {
                "Content-Type": content_type,
            },
        });
    }

    return new Response(null, { status: 500 });
}

// Default Entry
//
export default {
    async fetch(request: Request) {
        const url = new URL(request.url);
        return await serverFiles(url.pathname)
    },
};

// > deno serve --allow-read --allow-write --allow-net server.ts
