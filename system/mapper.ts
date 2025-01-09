// Imports
//
import { parseAsJson } from './html_parser.ts';
import { renderHtml } from './html_renderer.ts';
import { transpile } from './transpiler.ts';
import { tryReadTextFile, copyDeep } from './utils.ts';
import { join } from 'https://deno.land/std/path/mod.ts';
// Types
import type { Node, Context, Attributes } from './types.ts';

// Functions
//
function replaceSlot(node: Node, childrenToReplace: Node[]) {

    if (node.children == undefined) {
        return
    }

    //console.log("replaceSlot - node", node)
    //console.log("replaceSlot - childrenToReplace", childrenToReplace)

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

// Exports
//
export async function onMapTag(name: string, customTags: Record<string, any>, attributes: Attributes, context: Context, childrenToReplace: Node[]): Promise<[object, any]> {

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

    // /components/User.squirrel
    let filePath = customTags[name];

    // { id:"123", url:"www.foo.com", ..}
    const newContext = copyDeep(context);

    // <User id="123" style="color:red" ...>
    newContext["props"] = attributes;

    // ---
    // const {id} = Squirrel.props;
    // const resp = await fetch("/api/users");
    // const users = await resp.json();
    // ---
    // <ul id=${id}>
    //  ${users.map(user => `<li>${user.name}</li>`).join(" ")}
    // </ul>
    //

    console.log("1 onMapTag - filePath:", filePath);

    if (filePath.startsWith("/components/")) {
        filePath = join("./src", filePath);
    }

    if (filePath.startsWith("/layouts/")) {
        filePath = join("./src", filePath);
    }

    //
    // .squirrel -> html
    //
    if (filePath.endsWith(".squirrel")) {

        // CurrentDir = Users/christophreif/Documents/Projects/deno

        // @ts-ignore:
        const content = await Deno.readTextFile(filePath);

        // 1. Transpile "*.squirrel" to Html
        const [html, error1] = await transpile(content, newContext);
        if (error1 != null) {
            return [{}, error1]
        }

        // 2. Parse HTML as JSON
        const [tree, error2] = parseAsJson(html); // TODO: If error
        if (error2 != null) {
            return [{}, error2]
        }

        // 3. Substitute </slot> with children: [...]
        replaceSlot(tree, childrenToReplace);
        return [tree, null];
    }

    //
    // .uhtml --> html
    //
    if (filePath.endsWith(".uhtml")) {

        const [html, error1] = await tryReadTextFile(filePath);
        if (error1 != null) {
            return [{}, error1]
        }

        // 2. Parse HTML as JSON
        const [tree, error2] = parseAsJson(html); // TODO: If error
        if (error2 != null) {
            return [{}, error2]
        }

        return [tree, null]
    }

    return [{}, Error("not supported type")]
}

export async function mapCustomTags(customTags: Record<string, any>, html: string, context: Context): Promise<[string, any]> {

    const [dom_tree, error1] = parseAsJson(html);
    if (error1 != null) {
        return ["", error1]
    }

    const [html_, error2] = await renderHtml(dom_tree, context, onMapTag, customTags);
    if (error2 != null) {
        return ["", error2]
    }

    return [html_, null];
}
