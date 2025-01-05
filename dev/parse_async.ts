import { Parser } from 'npm:htmlparser2';

const buffer: string[] = [];

function append(text: string) {
    buffer.push(text);
}

async function asyncMapTag(name: string, attributes: any): Promise<string> {
    return new Promise<string>((resolve) => setTimeout(() => resolve("test"), 1000)); // Simulate async delay
}

// Simulate an async function for each tag opening and closing
async function asyncOnOpenTag(name: string, attributes: any) {
    // Simulate an async operation (e.g., fetching data)
    console.log(`1. Async opening tag: <${name}> with attributes:`, attributes);

    const newName = "foo";  // await asyncMapTag(name, attributes);
    console.log("newName", newName);

    append(`<${newName}>`);

    //return new Promise<void>((resolve) => setTimeout(() => resolve(), 10)); // Simulate async delay
}

async function asyncOnEndTag(name: string) {
    // Simulate an async operation (e.g., processing the closed tag)
    console.log(`3. Async closing tag: </${name}>`);

    append(`</${name}>`);

    return new Promise<void>((resolve) => setTimeout(() => resolve(), 500)); // Simulate async delay
}

async function asyncOnCloseTag(name: string) {
    // Simulate an async operation (e.g., processing the closed tag)
    console.log(`3. Async closing tag: </${name}>`);

    append(`</${name}>`);

    return new Promise<void>((resolve) => setTimeout(() => resolve(), 30)); // Simulate async delay
}

// Define the async parsing logic using htmlparser2
async function parseHtmlAsync(html: string) {
    const parser = new Parser({
        onopentag: async (name, attributes) => {
            await asyncOnOpenTag(name, attributes); // Handle the async operation here
        },
        onendtag: async (name) => {
            await asyncOnEndTag(name); // Handle the async operation here
        },
        ontext: (text) => {
            append(text.trim());
            console.log(`3. Text: ${text.trim()}`);
        },
        onclosetag: async (name) => {
            console.log(`Closing tag: ${name}`);
            await asyncOnCloseTag(name); // Handle the async operation here
        }
    });

    parser.write(html);
    parser.end();
}

// Example HTML content
const html = `
  <html>
    <body>
      <div class="container">
        <h1>Hello, World!</h1>
      </div>
    </body>
  </html>
`;

// Call the async HTML parser
await parseHtmlAsync(html);
console.log(buffer.join(""))
