
const source_ = `
    let result = "";
try {
    // Dynamically importing the module at runtime
    const { foo } = await import('./foo.ts');
    const { greet } = await import('./greet.ts');

    // Using the imported function
    result = foo() + " | " + greet();  // Output: Hello from the dynamic module!
} catch (error) {
    console.error("Error importing module:", error);
}
return result;
`;

const res = await eval(`(async () => { ${source_} })()`);
13
