// main.ts
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Sample HTML with custom tags and attributes
const html = `
 <html>
  <body>
   <custom-tag id="tag1" class="example">Hello, World!</custom-tag>
   <another-unknown data-info="secret" style="color:red;">Surprise!</another-unknown>
  </body>
 </html>
`;

function processCustomTag(tagname: string, content: string, attributes: Record<string, string>): string {
    let attrs: string[] = [];
    Object.entries(attributes).forEach(([key, value]) => {
        attrs.push(`${key}=${value}`)
    });
    return `<div name=${tagname} ${attrs.join(" ")}>${content}</div>`
}

// Parse the HTML
const document = new DOMParser().parseFromString(html, "text/html");

if (document) {
    // Find all custom tags
    const customTags = document.querySelectorAll("custom-tag, another-unknown");

    customTags.forEach((tag: any) => {
        const tagName = tag.tagName.toLowerCase(); // Get tag name
        const content = tag.textContent || ""; // Get inner content

        // Extract attributes
        const attributes: Record<string, string> = {};
        Array.from(tag.attributes).forEach((attr: any) => {
            attributes[attr.name] = attr.value;
        });

        // Call the function from the module
        const replacementHTML = processCustomTag(tagName, content, attributes);

        // Replace the custom tag with the processed HTML
        const div = document.createElement("div");
        div.innerHTML = replacementHTML; // Set the processed HTML
        tag.replaceWith(...div.childNodes); // Replace with parsed nodes
    });

    // Output the updated HTML
    console.log(document.documentElement.outerHTML);
}
