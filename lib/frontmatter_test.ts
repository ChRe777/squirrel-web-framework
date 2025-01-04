// Imports
//
import { parseFrontmatter } from "./frontmatter.ts"

// Test
// @ts-ignore
Deno.test("transpile simple squirrel file to html", async () => {

    const testFilePath = "./data/test_1.squirrel";

    // @ts-ignore
    const squirrel = await Deno.readTextFile(testFilePath);
    // @ts-ignore
    const want = {
        frontmatter: `const id = "123"
const foo = "foo"`,
        body: `<div id="\${id}">\${foo}</div>`
    }

    const got = parseFrontmatter(squirrel);
    const got_ = JSON.stringify(got);
    const want_ = JSON.stringify(want);
    if (got_ !== want_) {
        throw new Error(`Want \n${want_}\n, but got \n${got_}\n`);
    }
});
