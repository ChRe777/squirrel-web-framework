// Import Deno's file system API

const code = `
    import Foo from '../components/foo.squirrel';
    import Bar from '../components/bar.squirrel';
`;

// Function to transform the code
function transformImports(code: string): string {
    // Regular expression to match import statements
    const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\.squirrel)['"];/g;

    // Transform the imports into the desired format
    return code.replace(importRegex, (match, variable, path) => {
        return `const ${variable} = importComponent('${path}');`;
    });
}

console.log(transformImports(code))

// Define dynamic module content as a string
const dynamicModuleContent = `
  export function greet() {
    console.log("Hello from dynamically created module!");
  }
`;

// Specify the path for the temporary module
const tempFilePath = "./tempDynamicModule.ts";

// Write the dynamic content to a file
await Deno.writeTextFile(tempFilePath, dynamicModuleContent);

// Dynamically import the newly created module
const dynamicModule = await import(tempFilePath);

// Use the dynamically created function from the module
dynamicModule.greet();  // Output: Hello from dynamically created module!

// Optionally delete the temporary file (for cleanup)
await Deno.remove(tempFilePath);
