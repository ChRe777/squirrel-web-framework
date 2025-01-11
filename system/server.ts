// Imports
//
// @ts-ignore:
import { lookup } from "https://deno.land/x/mime_types@1.0.0/mod.ts";
// @ts-ignore:
import { join } from 'https://deno.land/std/path/mod.ts';
// Lib
import { makePage } from "./page.ts";
import { fileExists, makeContext } from './utils.ts';
import { logger } from "./logger.ts"
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

function ERROR(error: Error = Error("")): Response {
    logger.error(error);
    return new Response(null, { status: 500 });
}

function NOT_FOUND(text: string = "") {
    if (text == "") {
        text = "Not found"
    }

    return new Response(text, { status: 404 });
}

async function analysePath(path: string): Promise<[string, string]> {
    // o____  ____  ____  ____
    //       v     v
    //     page   public  ...

    // Init
    const NOT_FOUND = "NOT_FOUND";
    let type: string = NOT_FOUND;

    // Test 1
    //
    if (path == "/") {
        path = "/index_4.page"
        type = "PAGE";
    }

    console.log("type", type);

    // Test 2 .. Page files
    //
    if (type == NOT_FOUND) {
        const filePath = "./" + join(Constants.SRC_DIR, Constants.PAGES_DIR, `${path}.page`);
        console.log("filePath", filePath);
        const pageExists = await fileExists(filePath)
        if (pageExists) {
            type = "PAGE";
            path = `${path}.page`
        }

    }

    // Test 3 .. Public files
    //
    if (type == NOT_FOUND) {
        const publicFileExists = await fileExists(join(Constants.PUBLIC_DIR, `${path}.page`))
        if (publicFileExists) {
            type = "PUBLIC";
        }
    }

    // 4. NOT FOUND in PAGES or PUBLIC Folder
    //
    if (type == NOT_FOUND) {
        type = "NOT_FOUND";
    }

    return [type, path]
}


async function servePage(path: string, request: Request): Promise<Response> {

    // Init
    //
    const filepath = "./" + join(Constants.SRC_DIR, Constants.PAGES_DIR, path);

    // Check again
    //
    if (await fileExists(filepath) == false) {
        return NOT_FOUND();
    }

    // Make Context
    //
    const context = makeContext(request);

    // Make Page
    //
    const [squirrel, error] = await makePage(path, context);

    // Serve it
    //
    if (error == null) {
        return OK_Html(squirrel);
    } else {
        return ERROR(error)
    }
}


async function servePublics(path: string, request: Request): Promise<Response> {

    // Check if file NOT exists -> 404
    //
    const filepath = join(Constants.PUBLIC_DIR, path);

    // If exists --> 200
    //
    // @ts-ignore:
    const file = await Deno.readTextFile(filepath);

    // Serve It
    //
    return new Response(file, {
        status: 200,
        headers: {
            "Content-Type": getContentType(path) || Constants.DEFAULT_CONTENT_TYPE,
        },
    });

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
async function serveFiles(request: Request): Promise<Response> {

    // Init
    //
    const url = new URL(request.url);

    // Analyse Pathname
    //
    const [type, path] = await analysePath(url.pathname);

    console.log("type", type);
    console.log("path", path);

    // PAGE Files from "/src/pages"
    //
    if (type == "PAGE") {
        return await servePage(path, request);

    }

    // PUBLIC Files from "/public/"-Folder
    //
    if (type == "PUBLIC") {
        return await servePublics(path, request);
    }

    return NOT_FOUND();
}

/**
* Default request handler
*/
export default {

    async fetch(request: Request) {
        try {
            return await serveFiles(request);
        } catch (_) {
            return ERROR()
        }
    },

};

// > deno serve --allow-read --allow-write --allow-net server.ts
