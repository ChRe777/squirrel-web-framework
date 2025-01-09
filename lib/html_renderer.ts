// Example tree structure
/*
const tree = {
    name: 'root', attributes: { id: "123" },
    children: [
        {
            name: 'h1', attributes: { style: "color:red;" },
            children: [
                { name: 'text', attributes: { content: "foo bar" }, children: [] }
            ]
        },
        {
            name: 'User', attributes: {}, children: [
                { name: 'child2-1', attributes: {}, children: [] },
                { name: 'child2-2', attributes: {}, children: [] }
            ]
        },
        {
            name: 'Bar', attributes: {}, children: [
                { name: 'child3', attributes: {}, children: [] }
            ]
        }
    ]
};

const UserNode = {
    name: 'div', attributes: { id: "123" },
    children: [
        // SLOT to REPLACE
        //
        { name: 'slot', attributes: {}, children: [] },
        //
        // SLOT to REPLACE
    ]
};

const ChildrenForSLOT = [
    { name: 'child-AA', attributes: {}, children: [] },
    { name: 'child-BB', attributes: {}, children: [] }
]
    */

//The path /Users/christophreif/Documents/Projects/deno/node_modules/typescript/lib/tsserver.js doesn't point to a valid tsserver install. Falling back to bundled TypeScript version.

export async function renderHtml(root: any, context: Record<string, any>, onMapTag: any, customTags: Record<string, any>) {

    const buffer: string[] = [];

    /*
    // Simulated async function (e.g., data fetch, database query, etc.)
    async function fetchData(node: any) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Map Custom ${node.name}`);
            }, 300); // Simulate async delay
        });
    }
    */

    function isEmpty(obj: any) {
        return Object.keys(obj).length === 0;
    }

    function renderAttributes(attributes: Record<string, any>): string {
        if (attributes == null || attributes == undefined || isEmpty(attributes)) {
            return ""
        }

        const str = Object.entries(attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ")

        return " " + str;
    }

    // Function to traverse the tree asynchronously
    async function renderTree(node: any) {

        //
        // Fetch data for the current node
        //

        //console.log("renderTree - node", node);
        //console.log("renderTree - customTags", customTags);
        //console.log("renderTree - node.name", node.name);

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
            //     <slot/>             <<--- SLOT
            // </div>
            //

            const replacedNode = await onMapTag(node.name, customTags, node.attributes, context, node.children);
            node = replacedNode;
        }

        if (node.type == "text") {
            buffer.push(node.content);
            return
        }

        if (node.type == "comment") {
            buffer.push(`<!--${node.content}>`);
            return
        }

        if (node.type == "instruction") {
            buffer.push(`<${node.content}>`); // <!-DOCTYPE html>
            return
        }

        // node.type == "element"
        //
        if (node.name != "root") {
            buffer.push(`<${node.name}${renderAttributes(node.attributes)}>`);
        }

        // If the node has children, recursively traverse them
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
    }

    await renderTree(root);
    return buffer.join("")
}
