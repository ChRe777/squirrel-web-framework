// Imports
//
import { transformHtml } from "./importer.ts"

// Test
// @ts-ignore
Deno.test("tansform simple html with mapping", async () => {
    const test = `
        import User from "./test.squirrel";
        import Foo from "./data/foo.squirrel";`;
    const want = `
        customTags["User"] = "./test.squirrel";
        customTags["Foo"] = "./data/foo.squirrel";`;

    const got = "";
    if (got.trim() !== want.trim()) {
        throw new Error(`\nWant \n${want}\n, but got \n${got}`);
    }
});
