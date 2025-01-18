// ------------------------------IMPORTS---------------------------------------

// Lib
import { Attributes, Context, Node } from "../types/mod.ts";

// ------------------------------EXPORTS---------------------------------------

/**
 * @param root
 * @param context
 * @param onMapTag
 * @param customTags
 * @returns
 */
export async function renderHtml(
    root: Node,
    context: Context,
    onMapTag: any,
    customTags: Record<string, Error>,
): Promise<[string, Error | null]> {
    const buffer: string[] = [];

    // Function to traverse the tree asynchronously
    async function renderTree(node: Node): Promise<Error | null> {
        //
        // Fetch data for the current node
        //
        if (node.name in customTags) {
            // --> REPLACE <--
            //
            // <User id="test">
            //     <span>test</span>   <<--- SLOT
            // </User>
            //
            //  --> WITH <--
            //
            // <div>
            //     <h1>title</h1>
            //     <hole/>             <<--- HOLE
            // </div>
            //

            const [replacedNode, error] = await onMapTag(
                node.name,
                customTags,
                node.attributes,
                context,
                node.children,
            );
            if (error != null) {
                return error;
            }

            node = replacedNode;
        }

        if (node.type == "text") {
            buffer.push(node.content);
            return null;
        }

        if (node.type == "element" && node.name.toLowerCase() == "code") {
            console.log("node code:", node);
            buffer.push(`<${node.name}>`);
            buffer.push(node.content);
            buffer.push(`</${node.name}>`);
            return null;
        }

        if (node.type == "comment") {
            buffer.push(`<!--${node.content}>`);
            return null;
        }

        if (node.type == "instruction") {
            buffer.push(`<${node.content}>`); // <!-DOCTYPE html>
            return null;
        }

        // node.type == "element"
        //
        if (node.name != "root") {
            buffer.push(`<${node.name}${renderAttributes(node.attributes)}>`);
        }

        // If the node has children, recursively traverse them
        //
        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                await renderTree(child);
            }
        }

        // </div>
        //
        if (node.name != "root") {
            buffer.push(`</${node.name}>`);
        }

        return null;
    }

    const error = await renderTree(root);
    if (error != null) {
        return ["", error];
    }

    const html = buffer.join("");
    return [html, null];
}

// --------------------------------INTERN--------------------------------------

/**
 * @param obj
 * @returns
 */
function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * @param attributes
 * @returns
 */
function renderAttributes(attributes: Attributes): string {
    if (attributes == null || attributes == undefined || isEmpty(attributes)) {
        return "";
    }

    const str = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

    return " " + str;
}
