// @ts-ignore
import { Parser } from 'npm:htmlparser2';

// Docs
// see https://github.com/fb55/htmlparser2/blob/master/src/Parser.ts

function parseAsJson(html: string) {

    const root: object = {
        name: "root",
        children: []
    }

    let error = null;

    let tagStack: object[] = [];

    function getCurrent(): object {
        return tagStack[tagStack.length - 1];
    }

    function setNewCurrent(node: object) {
        return tagStack.push(node);
    }

    function setCurrentBack(): object | undefined {
        return tagStack.pop();
    }

    const parser = new Parser({

        onopentag: (name: string, attributes: Record<string, any>) => {

            // 1. Create new node
            //
            let newNode = {
                type: "element",
                name: name,
                attributes: attributes,
                children: []
            }

            // 2. Add new node to current
            //
            let current = getCurrent()
            current["children"].push(newNode);

            // 3. Set new current
            //
            setNewCurrent(newNode);
        },
        ontext: (text: string) => {

            // 1. Create text node
            //
            let newTextNode = {
                type: "text",
                content: text,
            }

            // 2. Add new node to current
            let current = getCurrent()
            current["children"].push(newTextNode);

            // This will now only run after onopentag's async task is finished
            console.log(`Text: '${text}'`);
        },
        onclosetag: (name) => {

            // 1. Set current node back to last parent
            //
            setCurrentBack();
        },
        oncomment: (data: string) => {

            // 1. Create text node
            //
            let newCommentNode = {
                type: "comment",
                content: data,
                children: []
            }

            // 2. Add new node to current
            //
            let current = getCurrent()
            current["children"].push(newCommentNode);

            console.log('comment: ' + data);
        },
        oncommentend: () => {
        },
        onprocessinginstruction: (name: string, data: string) => {
            // 1. Create text node
            //
            let newInstructionNode = {
                type: "instruction",
                name: name,
                content: data,
            }

            // 2. Add new node to current
            //
            let current = getCurrent()
            current["children"].push(newInstructionNode);

        },
        onend: () => {
            console.log('Parsing finished.');
        },
        onerror: (error: any) => {
            error = error;
            console.error('Parsing error:', error);
        },
    },
        // Options
        {
            decodeEntities: true,
            recognizeSelfClosing: true,
            lowerCaseTags: false,
        });

    // Init
    setNewCurrent(root);

    // Parse
    parser.write(html);
    parser.end();

    return [root, error];
}

// Example HTML content
//
const html = `<!DOCTYPE html>
    <!-- TEST --->
    <br/>`

const html2 = `
<html foo="bar">
<body id="123">
<div class="container">foo
<h1>Hello, World!</h1>
bar
<UserFoo />
<!-- TEST --->
</div>
</body>
</html>
`;

// Call the async parser
//

const [root, error] = parseAsJson(html);

console.log("root:", root, "\nerror:", error);

const example = `
{
  name: "root",
  children: [
    { name: "#text", content: "\n", children: [] },
    {
      name: "html",
      attributes: { foo: "bar" },
      children: [
        { name: "#text", content: "\n", children: [] },
        { name: "body", attributes: [Object], children: [Array] },
        { name: "#text", content: "\n", children: [] }
      ]
    },
    { name: "#text", content: "\n", children: [] }
  ]
}
//
{
  name: "root",
  children: [
    { name: "!DOCTYPE", content: "!DOCTYPE html" },
    { name: "#text", content: "\n    ", children: [] },
    { name: "#comment", content: " TEST -", children: [] },
    { name: "#text", content: "\n    ", children: [] },
    { name: "br", attributes: {}, children: [] }
  ]
}
`
