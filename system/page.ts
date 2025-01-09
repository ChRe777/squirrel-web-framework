// Imports
//
// @ts-ignore: dd

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
//import { join } from 'https://deno.land/std/path/mod.ts';

// Lib
import { transpile } from './transpiler.ts';
import { fileExists, createHash } from './utils.ts';
// Constants
import * as Constants from "./constants.ts"

// Exports
//
export async function makePage(path: string, context: Record<string, any>): Promise<[string, any]> {

    const filepath = join("./src/", Constants.PAGES_DIR, path)
    // @ts-ignore:
    const content = await Deno.readTextFile(filepath);

    // Check if hash exists
    //
    const hash = await createHash(content);
    const filePathHash = `./.cache/${hash}`
    const exists = await fileExists(filePathHash)

    const ENABLE_CACHE = false;

    if (exists && ENABLE_CACHE) {
        console.log("Read from cache");
        // @ts-ignore:
        const cachedHtml = await Deno.readTextFile(filePathHash);
        return [cachedHtml, null];
    }

    const [html, error] = await transpile(content, context);
    if (exists == false && error == null) {
        // @ts-ignore:
        await Deno.writeTextFile(filePathHash, html)
    }

    return [html, error];
}
