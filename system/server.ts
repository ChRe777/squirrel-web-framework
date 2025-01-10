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

/**
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
        path = "/home.page"
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

/**
* Default request handler
*/
export default {

    async fetch(request: Request) {
        return await serverFiles(request)
    },

};

// > deno serve --allow-read --allow-write --allow-net server.ts
