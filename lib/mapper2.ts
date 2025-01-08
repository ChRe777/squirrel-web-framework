// Imports
import { transpile } from './transpiler.ts';
// @ts-ignore
import { DOMParser, initParser, Node } from "jsr:@b-fuze/deno-dom/wasm-noinit";

// ...and when you need Deno DOM make sure you initialize the parser...
await initParser();

export async function mapCustomTagsAsync(customTags: Record<string, any>, html: string, context: Record<string, any>): Promise<string> {

    // customTags:
    // -----------
    // User -> ./component/user.squirrel
    // UserItem -> ./component/user_item.squirrel
    // ...

    const document = new DOMParser().parseFromString(html);

    const buffer: string[] = [];

    function append(str: string) {
        buffer.push(str);
    }

    function getAttributes(element: Element): Record<string, any> {
        const attributes = element.attributes;
        const result: Record<string, any> = {};

        // Loop through the NamedNodeMap and log each attribute's name and value
        for (let i = 0; i < attributes.length; i++) {
            const a = attributes[i];
            result[a.name] = a.value;
        }

        return result;
    }

    function copyDeep(original: Record<string, any>) {
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

                //Deno.writeTextFileSync(`./transpile${i++}.html`, html);

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

    async function onNode(name: string, attributes: Record<string, any>) {
        if (name in customTags) {

            // TODO
            const html = await mapTag(name, attributes, context) // <div id="123"><slot ></slot></div>

            console.log("type html:", typeof html);
            console.log("html:", html);
            // TODO:
            //let [openTag, closeTag] = html.split('<slot />');
            //tagStack.push(closeTag);

            //ppend(openTag);
        } else {
            //append(`<${name} ${mapAttributes(attributes)}>`);
        }
    }

    async function onText(text: string) {
        append(text);
    }

    async function traverseDOM(node: Node, level: number = 0) {

        // Handle current node
        //
        if (node.nodeType === Node.ELEMENT_NODE) {
            await onNode(node.nodeName, getAttributes(node));
        } else if (node.nodeType === Node.TEXT_NODE) {
            await onText(node.textContent);
        }

        // Recursively traverse child nodes
        //
        node.childNodes.forEach(async (childNode: any) => {
            await traverseDOM(childNode, level + 1);
        });
    }

    // Do map ny tranverse DOM
    await traverseDOM(document.documentElement);
    const mappedHtml = buffer.join(" ");

    return mappedHtml;
}
