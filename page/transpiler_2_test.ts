// Imports
//

function transpileImports(code: string): string {

    /*
    const endings = "(.squirrel|.uthml)"
    const pattern = `import\\s+{([^}]+)}\\s+from\\s+["']([^"']+)(${endings})["']\\s`
    const flags = 'g';  // Global search
    const regex_ = new RegExp(pattern, flags);
    */

    /*
    import { Foo } from "./test/foo.squirrel";
    import { User } from "./test/user.uhtml";

    customTags["Foo"] = "./test/foo.squirrel";
    customTags["User"] = "./foo/user.squirrel";
    */

    const regex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)(.squirrel|.uhtml)["']\s*[;]*/g;

    const result = code.replace(regex, (match, moduleNames, path, ending) => {
        // Split the module names in case there are multiple (e.g., { Foo, Bar })
        const modules = moduleNames.split(',').map((name: string) => name.trim());

        // Create the customTags assignments for each module
        return modules.map((moduleName: string) => `customTags["${moduleName}"] = "${path}${ending}";`).join('\n');
    });

    return result;
}

// @ts-ignore
Deno.test({
    name: "transpile imports of modules",
    fn: () => {
        const test = `
    import { User } from "./test.squirrel";
    import { Foo } from "./data/foo.uhtml";
`;
        const want = `
    customTags["User"] = "./test.squirrel";
    customTags["Foo"] = "./data/foo.uhtml";
`;

        const got = transpileImports(test);
        if (got.trim() !== want.trim()) {
            throw new Error(`\nWant \n${want}\n, but got \n${got}`);
        }
    }
});

// deno test --allow-read --allow-write transpiler_imports_test.ts
