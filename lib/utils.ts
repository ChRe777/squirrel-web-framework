// @ts-ignore:
import { encodeHex } from "jsr:@std/encoding/hex";
// @ts-ignore:
import { crypto } from "jsr:@std/crypto";

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        // @ts-ignore:
        await Deno.stat(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function createHash(content: string) {
    const messageBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
    const hash = encodeHex(hashBuffer);
    console.log(hash)
    return hash;
}

export function copyDeep(original: Record<string, any>) {
    return JSON.parse(JSON.stringify(original));
}

export function makeCookies(cookie: string | null): Record<string, string> {

    const cookies: Record<string, string> = {}
    if (cookie) {
        const xs: string[] = cookie.split(";")
        xs.map(kv => {
            const ys = kv.trim().split("=");
            cookies[ys[0].trim()] = ys[1].trim();
        })
    }
    return cookies;
}

export function makeContext(request: Request): Record<string, any> {
    const context = {
        host: request.headers.get("host"), // "localhost:8000",
        origin: request.headers.get("origin"), // "http://localhost:8000",
        cookies: makeCookies(request.headers.get("cookie")), // csrf_token=59c6b0a65fd2ff399af59ccc84c09e2d718da6684f608516cf2292ec708251b2; foo=bar"
        url: request.url
    }
    return context
}
