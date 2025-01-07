import { DOMParser, initParser, Node } from "jsr:@b-fuze/deno-dom/wasm-noinit";

// ...and when you need Deno DOM make sure you initialize the parser...
await initParser();

// Then you can use Deno DOM as you would normally
const doc = new DOMParser().parseFromString(
    `
    <h1>Lorem ipsum dolor...</h1>
  `,
    "text/html",
);

// Function to traverse and print the DOM tree
function traverseDOM(node: Node, level: number = 0) {

    // Print the current node's type and its content (if it's an element node)
    if (node.nodeType === Node.ELEMENT_NODE) {
        console.log(' '.repeat(level * 2) + `<${node.nodeName.toLowerCase()}>`);
    } else if (node.nodeType === Node.TEXT_NODE) {
        console.log(' '.repeat(level * 2) + node.textContent?.trim());
    }

    // Recursively traverse child nodes
    node.childNodes.forEach((childNode) => {
        traverseDOM(childNode, level + 1);
    });
}

// Start traversing the document from the root node
traverseDOM(doc.documentElement);
