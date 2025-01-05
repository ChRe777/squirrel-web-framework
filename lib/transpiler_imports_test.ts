// Imports
//

import { transpileImports } from "./transpiler.ts"

// @ts-ignore
Deno.test({
    name: "transpile imports of modules",
    only: true,
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

// deno test --allow-read --allow-write transpiler_imports_test.ts
