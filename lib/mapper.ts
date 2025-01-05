// Imports
// @ts-ignore
import { Parser } from 'npm:htmlparser2';
import { transpile } from './transpiler.ts';

// Exports
//
export function mapCustomTags(customTags: Record<string, any>, html: string, context: Record<string, any>): string {

    const buffer: string[] = []

    const append = (x: string) => {
        buffer.push(x);
        console.log("append buffer:", buffer);
    }

    const copyDeep = (original: Record<string, any>) => {
        return JSON.parse(JSON.stringify(original));
    }

    function mapTag(name: string, attributes: any, context: Record<string, any>) {
        const filePath = customTags[name];
        // @ts-ignore
        const squirrel = Deno.readTextFileSync(filePath);
        const newContext = copyDeep(context)
        newContext["Props"] = attributes;
        const html = transpile(squirrel, newContext);
        return html;
    }

    const tagStack: string[] = [];

    const parser = new Parser(
        {
            onopentag(name: string, attributes: any) {
                if (name in customTags) {

                    console.log("name", name, "context", context);

                    const html = mapTag(name, attributes, context) // <div id="123"><slot ></slot></div>
                    let [openTag, closeTag] = html.split('<slot />');
                    tagStack.push(closeTag);
                    append(openTag);
                } else {
                    append(`<${name} ${mapAttributes(attributes)}>`);
                }
            },
            ontext(text: string) {
                append(text);
            },
            onclosetag(name: string) {
                if (name in customTags) {
                    const name = tagStack.pop();
                    console.log("name", name);
                    if (name) {
                        append(name);
                    }
                } else {
                    append(`</${name}>`);
                }
            }
        },
        {
            decodeEntities: true,
            recognizeSelfClosing: true,
            lowerCaseTags: false,
        }
    );

    parser.write(html);
    parser.end();

    return buffer.join("")
}

// <OpenTagNAME attributes>TEXT<EndTagName>

export function mapAttributes(attributes: Record<string, any>): string {
    const str = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    return str;
}
