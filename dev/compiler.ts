const data = {
    code: `
    // Lib
    //
    const { importDynamic } = await import('./lib.ts');
    const { transformHtml } = await import('./lib.ts');

    // Mappings
    //
    const mapping: Record<string, any> = {};

    // Imports
    //
    const Bar = await importDynamic('./test.squirrel');
    mapping["Bar"] = Bar;

    // Code
    const name = "bar";
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await response.json();

    `,
    template: `
    \${Bar.foo()}
    <div name=\${name}>
        \${users.map((user) => \`<li>\${user.name}</li>\`).join('')}
    </div>
    `
};

// Function to transform the code
function transformImports(code: string): string {
    // Regular expression to match import statements
    const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\.squirrel)['"];/g;

    // Transform the imports into the desired format
    return code.replace(importRegex, (match, variable, path) => {
        return `const ${variable} = await importDynamic('${path}');`;
    });
}

export async function compile2(data: any): Promise<string> {

    const code_ = transformImports(data.code);

    // console.log(code_);

    // Interpolating the values of squirrel.code and squirrel.template directly into the function string
    const code = `
return async function() {
    //
    ${code_}
    //
    const html = \`${data.template}\`;
    const result = transformHtml(mapping, html);
    return result;
};
    `;

    //console.log(code);

    // Creating a dynamic async function using new Function
    const dynamicFunction = new Function(code);

    // Calling the async function and handling the promise
    const result = await dynamicFunction();

    // Return result
    return await result();
}

export async function compile(data: any): Promise<string> {

    const code_ = transformImports(data.code);

    // console.log(code_);

    // Interpolating the values of squirrel.code and squirrel.template directly into the function string
    const code = `
return async function() {
    ${code_}
    return \`${data.template}\`;
};
`;
    // Creating a dynamic async function using new Function
    const dynamicFunction = new Function(code);

    // Calling the async function and handling the promise
    const result = await dynamicFunction();

    // Return result
    return await result();
}

// console.log(await compile2(data));
