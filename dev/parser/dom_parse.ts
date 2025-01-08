import { DOMParser, Element, Node } from "jsr:@b-fuze/deno-dom";

// Then you can use Deno DOM as you would normally
const doc = new DOMParser().parseFromString(
    `
    <h1 style="color:red; border: 1px" id="1">Lorem ipsum dolor...</h1>
  `,
    "text/html",
);

function getAllAttributes(element: Element) {
    const attributes = element.attributes;

    const buffer: string[] = [];

    // Loop through the NamedNodeMap and log each attribute's name and value
    for (let i = 0; i < attributes.length; i++) {
        const a = attributes[i];
        buffer.push(`${a.name}="${a.value}"`);
    }

    return buffer.join(" ");
}

// Function to traverse and print the DOM tree
function traverseDOM(node: Node, level: number = 0) {

    // Print the current node's type and its content (if it's an element node)
    if (node.nodeType === Node.ELEMENT_NODE) {

        const attributes = getAllAttributes(node);
        console.log(' '.repeat(level * 2) + `<${node.nodeName} ${attributes}>`);

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
