// Imports
//
// @ts-ignore:
import { lookup } from "https://deno.land/x/mime_types@1.0.0/mod.ts";
// @ts-ignore:
import { join } from 'https://deno.land/std/path/mod.ts';
// Lib
import { makePage } from "./page.ts";
import { fileExists, makeContext } from './utils.ts';
// Constants
import * as Constants from "./constants.ts"

// config.ts
// const config = await import('./config.json', { with: { type: 'json' } });

/**
*
* @param fileName
* @returns
*/
function getContentType(fileName: string): false | string {
    return lookup(fileName);  // Looks up MIME type by file extension
}

function OK_Html(html: string): Response {
    return new Response(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html",
        }
    })
}

function ERROR(error: Error): Response {
    console.log(error);
    return new Response(null, { status: 500 });
}

function NOT_FOUND(text: string = "") {
    if (text == "") {
        text = "Not found"
    }

    return new Response(text, { status: 404 });
}

/**
* Serve Files
*
*   http://server.com/index_1 -> src/page/index_1
*
* @param path
* @param context
* @returns
*/
async function serverFiles(request: Request): Promise<Response> {

    const url = new URL(request.url);
    const context = makeContext(request);

    let path = url.pathname;
    if (path === "/") {
        path = "/index_4"
    }

    path += ".page"
    console.log("path", path);

    // PAGE Files from "/src/pages"
    //
    if (path.endsWith(".page")) {

        const filepath = join("./src/", Constants.PAGES_DIR, path);

        if (await fileExists(filepath) == false) {
            return NOT_FOUND();
        }

        const [squirrel, error] = await makePage(path, context);

        if (error == null) {
            return OK_Html(squirrel);
        } else {
            return ERROR(error)
        }

    }

    // PUBLIC Files from "/public/"-Folder
    //
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

/**
* Default request handler
*/
export default {

    async fetch(request: Request) {
        return await serverFiles(request)
    },

};

// > deno serve --allow-read --allow-write --allow-net server.ts
