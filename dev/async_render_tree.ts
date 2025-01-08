// Example tree structure
const tree = {
    name: 'root', attributes: { id: "123" },
    children: [
        { name: 'child1', attributes: { style: "color:red;" }, children: [] },

        // SLOT to REPLACE
        //
        { name: 'slot', attributes: {}, children: [] },
        //
        // SLOT to REPLACE

        {
            name: 'child2', attributes: {}, children: [
                { name: 'child2-1', attributes: {}, children: [] },
                { name: 'child2-2', attributes: {}, children: [] }
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

//The path /Users/christophreif/Documents/Projects/deno/node_modules/typescript/lib/tsserver.js doesn't point to a valid tsserver install. Falling back to bundled TypeScript version.

async function renderHtml(root: any) {

    const buffer: string[] = [];

    const customTags = {
        "child2": "./path/to",
        "child2-2": "./path/to",
    }

    // Simulated async function (e.g., data fetch, database query, etc.)
    async function fetchData(node: any) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Map Custom ${node.name}`);
            }, 300); // Simulate async delay
        });
    }

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

    function replaceSlot(node: any, childrenToReplace: any) {

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

        return node;
    }

    async function mapTag(name: string, attributes: Record<string, any>, context: Record<string, any>, childrenToReplace: any) {

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

        // 1. Transpile ".squirrel" nach HTML
        //const html = transpile(content, newContext);

        // 2. Parse HTML as JSON
        //const tree = parseAsJson(html);

        const tree = UserNode;

        // 3. Substitute </slot> with children: [...]
        const treeSlotReplaced = replaceSlot(tree, childrenToReplace);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(treeSlotReplaced);
            }, 300); // Simulate async delay
        });
    }

    // Function to traverse the tree asynchronously
    async function renderTree(node: any) {

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
            //     <slot/>             <<--- SLOT
            // </div>
            //


            const replacedNode = await mapTag(node, {}, {}, ChildrenForSLOT);
            node = replacedNode;
        }

        // <div id="123">
        //
        buffer.push(`<${node.name}${renderAttributes(node.attributes)}>`);

        // If the node has children, recursively traverse them
        for (const child of node.children) {
            await renderTree(child);
        }

        // </div>
        //
        buffer.push(`</${node.name}>`);
    }

    await renderTree(root);
    return buffer.join("")
}

const html = await renderHtml(tree);
console.log(html);
