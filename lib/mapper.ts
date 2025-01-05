// Imports
// @ts-ignore
import { Parser } from 'npm:htmlparser2';
import { transpile } from './transpiler.ts';

// Exports
//
export function mapCustomTags(customTags: Record<string, any>, html: string, context: Record<string, any>): string {

    const buffer: string[] = [];
    const tagStack: string[] = [];

    const append = (x: string) => {
        buffer.push(x);
    }

    const toString = (): string => {
        return buffer.join("");
    }

    const copyDeep = (original: Record<string, any>) => {
        return JSON.parse(JSON.stringify(original));
    }

    function mapTag(name: string, attributes: any, context: Record<string, any>) {
        const filePath = customTags[name];
        // @ts-ignore
        const squirrel = Deno.readTextFileSync(filePath);
        const newContext = copyDeep(context)

        // Insert attributes as props
        newContext["props"] = attributes;

        const html = transpile(squirrel, newContext);
        return html;
    }

    const parser = new Parser(
        {
            // open
            //   v
            // <div>{text]</div>
            onopentag(name: string, attributes: any) {
                if (name in customTags) {
                    const html = mapTag(name, attributes, context) // <div id="123"><slot ></slot></div>

                    // TODO:
                    let [openTag, closeTag] = html.split('<slot />');
                    tagStack.push(closeTag);


                    append(openTag);
                } else {
                    append(`<${name} ${mapAttributes(attributes)}>`);
                }
            },
            // Text between tags <div>{text]</div>
            ontext(text: string) {
                append(text);
            },
            //             close
            //               v
            // <div>{text]</div>
            onclosetag(name: string) {
                if (name in customTags) {
                    const name = tagStack.pop();
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

    return toString();
}

// <OpenTagNAME attributes>TEXT<EndTagName>

export function mapAttributes(attributes: Record<string, any>): string {
    const str = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    return str;
}
