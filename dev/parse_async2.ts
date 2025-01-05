import { Parser } from 'npm:htmlparser2';

// Async function to simulate processing in the onopentag callback
async function asyncOnOpenTag(name: string, attributes: any) {
    console.log(`Opening tag: <${name}> with attributes:`, attributes);
    return new Promise<void>((resolve) => {
        // Simulate async work (e.g., fetching data or some processing)
        setTimeout(() => {
            console.log(`Finished async operation for <${name}>`);
            resolve();
        }, 1000); // Simulate a 1 second async task
    });
}

// Define the parser and control the flow
async function parseHtmlAsync(html: string) {
    const parser = new Parser(
        {
            onopentag: async (name, attributes) => {
                await asyncOnOpenTag(name, attributes); // Wait for async task to finish
            },
            ontext: (text) => {
                // This will now only run after onopentag's async task is finished
                console.log(`Text: ${text}`);
            },
            onend: () => {
                console.log('Parsing finished.');
            },
            onerror: (error) => {
                console.error('Parsing error:', error);
            },
        },
        { decodeEntities: true }
    );

    parser.write(html);
    parser.end();
}

// Example HTML content
const html = `<html><body><div class="container"><h1>Hello, World!</h1></div></body></html>`;

// Call the async parser
parseHtmlAsync(html).then(() => {
    console.log('Finished parsing HTML');
}).catch((err) => {
    console.error('Error during parsing:', err);
});
