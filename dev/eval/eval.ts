async function evaluateAndReturn(dynamicCode: string): Promise<any> {
    return eval(`(async () => { ${dynamicCode} })()`);  // Dynamically evaluate the code
}

const source = `
    const module = await import('./foo.ts');
    console.log(typeof module)
    //return foo();  // Call the imported function and return its result
`;

evaluateAndReturn(source).then(result => {
    console.log(result);  // Output: Hello from the dynamic module!
});
