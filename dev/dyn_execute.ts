// File: dynamic-execute.ts

// Step 1: Write TypeScript code to a file
const tsCode = `
  console.log("Hello from the new Deno process!");
  const greet = (name: string) => \`Hello, \${name}!\`;
  console.log(greet("Deno"));
`;

await Deno.writeTextFile("./greet.ts", tsCode);
console.log("TypeScript code written to 'greet.ts'.");

// Step 2: Spawn a new Deno process to execute the TypeScript file

const process = Deno.run({
    cmd: ["deno", "run", "--unstable", "--allow-read", "./greet.ts"], // command to run
    stdout: "piped",  // capture stdout
    stderr: "piped",  // capture stderr
});

// Step 3: Capture the output and read the result

const output = await process.output(); // Wait for the subprocess to complete and capture stdout
const errorOutput = await process.stderrOutput(); // Capture any stderr

// Convert the output (Buffer) to string
const outputStr = new TextDecoder().decode(output);
const errorStr = new TextDecoder().decode(errorOutput);

// Display the results
console.log("Output from the new Deno process:");
console.log(outputStr);

if (errorStr) {
    //console.error("Error output from the Deno process:");
    //console.error(errorStr);
}

// Close the process
process.close();

// > deno --allow-run --allow-write dyn_execute.ts
