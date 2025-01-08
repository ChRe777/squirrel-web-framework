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

    function mapTag(name: string, attributes: Record<string, any>, context: Record<string, any>) {

        try {

            // ./components/User.squirrel
            const filePath = customTags[name];

            // { id:"123", url:"www.foo.com", ..}
            const newContext = copyDeep(context)

            // <User id="123" style="color:red" ...>
            newContext["props"] = attributes;

            if (filePath.endsWith(".squirrel")) {
                // @ts-ignore
                const content = Deno.readTextFileSync(filePath);

                // ---
                // const Squirrel = {props: {foo:"bar"}} // <-- injected
                // const {id} = Squirrel.props;
                // const resp = await fetch("/api/users");
                // const users = await resp.json();
                // ---
                // <ul id=${id}>
                //  ${users.map(user => html`<li>${user.name}</li>`)}
                // </ul>
                //
                const html = transpile(content, newContext);

                Deno.writeTextFileSync(`./transpile${i++}.html`, html);

                return html;
            }

            if (filePath.endsWith(".uhtml")) {
                // @ts-ignore
                const html = Deno.readTextFileSync(filePath);
                // TODO: Transpile uhtml --> <div>...</div><script>...</script>
                return html;
            }
        } catch {
            return "<!-- UNKNOWN TAG -->"
        }

    }

    let i = 0;

    const parser = new Parser(
        {
            // open
            //   v
            // <User>{text]</User>
            async onopentag(name: string, attributes: any) {
                if (name in customTags) {

                    // TODO
                    const html = await mapTag(name, attributes, context) // <div id="123"><slot ></slot></div>

                    console.log("type html:", typeof html);
                    console.log("html:", html);
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

export function mapAttributes(attributes: Record<string, any>): string {
    const str = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    return str;
}
