// Imports
//
import { transpile } from "./transpiler.ts"
import { transpileImports } from "./transpiler.ts"

// @ts-ignore
Deno.test({
    name: "transpile imports of modules",
    fn: () => {
        const test = `
    import {User} from "./test.squirrel";
    import {Foo} from "./data/foo.squirrel";
`;
        const want = `
    customTags["User"] = "./test.squirrel";
    customTags["Foo"] = "./data/foo.squirrel";
`;

        const got = transpileImports(test);
        if (got.trim() !== want.trim()) {
            throw new Error(`\nWant \n${want}\n, but got \n${got}`);
        }
    }
});

// Test
// @ts-ignore
Deno.test("transpile simple squirrel file to html", () => {

    const testFilePath = "./data/test_1.squirrel";
    const wantFilePath = "./data/test_1.html"

    // @ts-ignore
    const squirrel = Deno.readTextFileSync(testFilePath);
    // @ts-ignore
    const want = Deno.readTextFileSync(wantFilePath);

    const got = transpile(squirrel);
    if (got.trim() !== want.trim()) {
        throw new Error(`Want ${want}, but got ${got}`);
    }
});

// Test
// @ts-ignore
Deno.test("Test: Transpile complex squirrel file to html", () => {

    const testFilePath = "./data/test_2.squirrel";
    const wantFilePath = "./data/test_2.html";
    const context = {
        "props": { "id": 123, "foo": "bar" }
    };

    // @ts-ignore
    const squirrel = Deno.readTextFileSync(testFilePath);
    // @ts-ignore
    const want = Deno.readTextFileSync(wantFilePath);

    const got = transpile(squirrel, context);
    if (got.trim() !== want.trim()) {
        throw new Error(`Want ${want}, but got ${got}`);
    }
});



// deno test --allow-read --allow-write
