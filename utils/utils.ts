//
// SINGLE POINTS of IMPORTS
//

// @ts-ignore:
import { encodeHex } from "../deps.ts";
// @ts-ignore:
import { crypto } from "../deps.ts";
// @ts-ignore:
import { lookup as lookup_ } from "../deps.ts";
// @ts-ignore:
import { join as join_ } from "../deps.ts";

// Lib
import { logger } from "../logging/mod.ts";

// Constants
import * as Constants from "../constants/mod.ts";

// Exports
//

export function RESPONSE_ERROR(error: Error = Error("")): Response {
    logger.error(error);
    return new Response(null, { status: 500 });
}

export function RESPONSE_NOT_FOUND(text: string = "") {
    if (text == "") {
        text = "Not found";
    }

    return new Response(text, { status: 404 });
}

export function RESPONSE_OK_HTML(html: string): Response {
    return new Response(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html",
        },
    });
}

export function RESPONSE_FILE(file: Uint8Array, path: string): Response {
    return new Response(file, {
        status: 200,
        headers: {
            "Content-Type": lookup(path) || Constants.DEFAULT_CONTENT_TYPE,
        },
    });
}

// Wraps Libary join
//
export function join(...paths: string[]): string {
    return join_(...paths);
}

// Wraps library lookup
//
export function lookup(path: string): false | string {
    return lookup_(path);
}

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        // @ts-ignore:
        await Deno.stat(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function tryReadTextFile(
    filePath: string,
): Promise<[string, any]> {
    let html = "";
    let error = null;
    try {
        // @ts-ignore:
        html = await Deno.readTextFile(filePath);
        // Filepath could be wrog
    } catch (error_) {
        error = error_;
    }
    return [html, error];
}

export async function createHash(content: string) {
    const messageBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
    const hash = encodeHex(hashBuffer);
    console.log(hash);
    return hash;
}

export function copyDeep(original: Record<string, any>) {
    return JSON.parse(JSON.stringify(original));
}

export function makeCookies(cookie: string | null): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (cookie) {
        const xs: string[] = cookie.split(";");
        xs.map((kv) => {
            const ys = kv.trim().split("=");
            cookies[ys[0].trim()] = ys[1].trim();
        });
    }
    return cookies;
}

export function makeContext(request: Request): Record<string, any> {
    const url_ = new URL(request.url);
    const context = {
        cookies: makeCookies(request.headers.get("cookie")), // csrf_token=59c6b0a65fd2ff399af59ccc84c09e2d718da6684f608516cf2292ec708251b2; foo=bar"
        url: request.url,
        host: url_.hostname,
        origin: url_.origin,
        protocol: url_.protocol,
        pathname: url_.pathname,
    };
    return context;
}

/*
hash: "";
host: "chatgpt.com";
hostname: "chatgpt.com";
href: "https://chatgpt.com/foo";
origin: "https://chatgpt.com";
password: "";
pathname: "/foo";
port: "";
protocol: "https:";
*/
