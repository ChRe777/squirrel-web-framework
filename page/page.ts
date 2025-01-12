// Imports
//
// @ts-ignore: dd

// Lib
import { transpile } from './transpiler.ts';
import { fileExists, createHash, join } from '../utils/mod.ts';
// Constants
import * as Constants from "../constants/mod.ts"

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
