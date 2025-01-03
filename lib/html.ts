// Imports
//
import { Parser } from "npm:htmlparser2";
import { isHtml5Tag } from "./lib.ts";

// Constants
//
const html = `
<foo id="12" foo=a>
    <foo style="color:red">test</foo>
</foo>
`;

function processAttributes(attributes: Record<string, string>): string {
    return Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
}

export function transform(mapping: Record<string, any>, html: string) {

    function processCustomOpenTag(tagname: string, attributes: Record<string, string>): string {

        if (tagname in mapping) {
            const fn = mapping[tagname].onopentag
            return fn(tagname, attributes)
        }

        return `<div tag-name="${tagname}" ${processAttributes(attributes)}>`
    }

    function processCustomCloseTag(tagname: string): string {

        if (tagname in mapping) {
            const fn = mapping[tagname].onclosetag
            return fn(tagname)
        }

        return `</${tagname}>`
    }

    /*
        Process HTML and convert custom tags
    */
    function processHtml(html: string): string {

        const buffer: string[] = [];

        function onopentag(name: string, attributes: any) {
            if (isHtml5Tag(name)) {
                buffer.push(`<${name} ${processAttributes(attributes)}}>`);
            } else {
                buffer.push(processCustomOpenTag(name, attributes));
            }
        }

        function ontext(text: string) {
            buffer.push(text);
        }

        function onclosetag(name: string) {
            if (isHtml5Tag(name)) {
                buffer.push(`</${name}>`);
            } else {
                buffer.push(processCustomCloseTag(name));
            }
        }

        function onend() {
            console.log("Parsing complete");
        }

        const options = {
            decodeEntities: true,
            recognizeSelfClosing: true
        };

        const fns = {
            onopentag,
            ontext,
            onclosetag,
            onend,
        };

        const parser = new Parser(fns, options);
        parser.write(html);
        parser.end();

        return buffer.join("");
    }

    return processHtml(html);
}





const mapping: Record<string, any> = {}
mapping["foo"] = {
    "onopentag": function (tagname: string, attributes: Record<string, string>) {
        return `<div type="${tagname}" ${processAttributes(attributes)}>`
    },
    // </slot>
    "ontext": function (content: string) {
        return content;
    },
    "onclosetag": function (tagname: string) {
        tagname = "div";
        return `</${tagname}>`
    }
}

const example = `
    index.squirrel

    ---
    import Layout from "./layouts/layout.squirrel"
    ---

    <Layout title="foo">
        TEST
    </Layout>

    -->

    layout.squirrel:
    ---
    const { title } = props;
    ---
    <h1>\${title}</h1>
    <div class="columns">
        <div class="column col-6">
            <slot />
        </div>
    </div>

    -->

    <div class="columns">
        <div class="column col-6">
            TEST
        </div>
    </div>
`

console.log(transform(mapping, html));
