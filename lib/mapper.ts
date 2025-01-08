// Imports
//
import { parseAsJson } from './html_parser.ts';
import { renderHtml } from './html_renderer.ts';
import { transpile } from './transpiler.ts';

// Functions
//
function copyDeep(original: Record<string, any>) {
    return JSON.parse(JSON.stringify(original));
}

function replaceSlot(node: any, childrenToReplace: any) {

    if (node.children == undefined) {
        return
    }

    console.log("replaceSlot - node", node)
    console.log("replaceSlot - childrenToReplace", childrenToReplace)

    // [
    //      child1
    //      slot    <-- [childA, childB, childC]
    //      child2
    //      child2
    // ]
    //

    let indexToReplace = -1;
    let index = 0;

    for (const child of node.children) {
        // <slot />
        if (child.name == "slot") {
            indexToReplace = index;
        }
        index++;
    }

    // Replace if found
    if (indexToReplace >= 0) {
        node.children.splice(indexToReplace, 1, ...childrenToReplace);
    }

    // Try to find <slot/> it in tree
    if (indexToReplace == -1) {
        // Recursive
        for (const child of node.children) {
            replaceSlot(child, childrenToReplace);
        }
    }
}

async function onMapTag(name: string, customTags: Record<string, any>, attributes: Record<string, any>, context: Record<string, any>, childrenToReplace: any): Promise<any> {

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

    // ./components/User.squirrel
    const filePath = customTags[name];

    // { id:"123", url:"www.foo.com", ..}
    const newContext = copyDeep(context);
    // <User id="123" style="color:red" ...>
    newContext["props"] = attributes;

    let html = "";

    if (filePath.endsWith(".squirrel")) {

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

        // @ts-ignore
        const content = await Deno.readTextFile(filePath);

        // Transpile "*.squirrel" to Html
        html = await transpile(content, newContext);

    }

    if (filePath.endsWith(".uhtml")) {
        // @ts-ignore
        html = await Deno.readTextFile(filePath);
    }

    // 2. Parse HTML as JSON
    const [tree, error] = parseAsJson(html); // TODO: If error

    // 3. Substitute </slot> with children: [...]
    replaceSlot(tree, childrenToReplace);

    return tree;

    /*
    return new Promise((resolve) => {
        resolve(treeSlotReplaced);
    });
    */

}

// Exports
//
export async function mapCustomTags(customTags: Record<string, any>, html: string, context: Record<string, any>): Promise<string> {

    // TODO: Handle error to TOP
    //
    const [tree, error] = parseAsJson(html);

    const html_ = renderHtml(tree, onMapTag, customTags);
    return html_;
}
