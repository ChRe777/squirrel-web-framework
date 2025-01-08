import { parse } from "https://deno.land/x/deno_dom@v0.1.36/deno-dom-wasm.ts";

// HTML fragment as a string
const htmlFragment = `<div><p>Hello, world!</p><a href="https://deno.land">Deno</a></div>`;

// Parse the HTML fragment into a DOM object
const document = parse(htmlFragment);

// Access elements in the parsed DOM
const pElement = document.querySelector("p");
console.log(pElement?.textContent); // Output: Hello, world!

const linkElement = document.querySelector("a");
console.log(linkElement?.getAttribute("href")); // Output: https://deno.land
