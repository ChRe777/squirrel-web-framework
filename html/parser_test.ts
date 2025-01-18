import { parseAsJson } from "./parser.ts";
import { renderHtml } from "./renderer.ts";
const html2 = `<code>test
test
<h1></h1></code><foo>bar</foo>`;
const [tree2, error2] = parseAsJson(html2);

console.log(tree2);
console.log(await renderHtml(tree2, {}, null, {}));
