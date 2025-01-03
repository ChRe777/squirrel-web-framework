
let buffer: string[] = ["Apple", "Banana", "Orange"];

function appendString(str: string): void {
    buffer.push(str)
}

const startTime = performance.now();
for (let i = 0; i < 100000; i++) {
    appendString("Hello, ");
    appendString("world!\n");
}

const endTime = performance.now();

const result = buffer.join("")
// Calculate the time taken in milliseconds
const timeTaken = endTime - startTime;
console.log(`Time taken: ${timeTaken.toFixed(3)} ms`);
//console.log(result);
