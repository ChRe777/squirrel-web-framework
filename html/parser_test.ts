import { parseAsJson } from './html_parser.ts';

const html = `<html>
    <head>
        <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/spectre.css/0.4.5/spectre.min.css"
        />
    </head>
    <body>
        <h3>Users:</h3>
        <ul>
            UserList
        </ul>
    </body>
</html> `
const [tree, error] = parseAsJson(html);
console.log(tree);
