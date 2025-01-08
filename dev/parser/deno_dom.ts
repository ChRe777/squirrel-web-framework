import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";

//   non-JSR wasm url import: https://deno.land/x/deno_dom/deno-dom-wasm.ts
// non-JSR native url import: https://deno.land/x/deno_dom/deno-dom-native.ts

const doc = new DOMParser().parseFromString(`
    <h1>Hello World!</h1>
    <p>Hello from <a href="https://deno.land/">Deno!</a></p>
`,
    "text/html",
);

console.log(doc.querySelector("h1").nodeName);
