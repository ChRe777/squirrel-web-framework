// Docs:
//
// see https://github.com/fb55/htmlparser2/blob/master/src/Parser.ts
//
// @ts-ignore:
import { Error, Parser } from "npm:htmlparser2";
import { Attributes } from "../types/mod.ts";
import { escapeHtml } from "../deps.ts";

// Type
import type { Node } from "../types/mod.ts";

function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

function renderAttributes(attributes: Attributes): string {
    if (attributes == null || attributes == undefined || isEmpty(attributes)) {
        return "";
    }

    const str = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

    return " " + str;
}

// Exports
//
export function parseAsJson(html: string) {
    const tagStack: Node[] = [];
    let error_: Error = null;
    const root: Node = {
        name: "root",
        type: "root",
        children: [],
        attributes: {},
        content: "",
    };

    const codeBuffer: string[] = [];

    const getCurrent = (): Node => tagStack[tagStack.length - 1];
    const setNewCurrent = (node: Node): number => tagStack.push(node);
    const setCurrentBack = (): object | undefined => tagStack.pop();
    let insideCodeTag = false;

    const onopentag = (name: string, attributes: Record<string, any>) => {
        //
        // <NavTree children='${JSON.stringify(nav_tree.children)}' />
        // <NavTree :children='nav_tree.children' />
        //
        //console.log("onopentag - attributes:", attributes);

        if (insideCodeTag) {
            const attr = renderAttributes(attributes);
            codeBuffer.push(`<${name}${attr}>`);
            return;
        }

        // 1. Create new node
        //
        const newNode: Node = {
            type: (name == "slot") ? "slot" : "element",
            name: name,
            attributes: attributes,
            children: [],
            content: "",
        };

        // 2. Add new node to current
        //
        const current = getCurrent();
        current["children"].push(newNode);

        // 3. Set new current
        //
        setNewCurrent(newNode);

        if (name.toLowerCase() == "code") {
            insideCodeTag = true;
        }
    };

    const ontext = (text: string) => {
        if (insideCodeTag) {
            codeBuffer.push(text);
            return;
        }

        // 1. Create text node
        //
        const newTextNode = {
            type: "text",
            name: "#text",
            attributes: {},
            children: [],
            content: text,
        };

        // 2. Add new node to current
        //
        const current = getCurrent();
        current["children"].push(newTextNode);
    };

    const onclosetag = (_name: string) => {
        if (insideCodeTag && _name.toLowerCase() != "code") {
            codeBuffer.push(`</${_name}>`);
            return;
        }

        if (insideCodeTag && _name.toLowerCase() == "code") {
            insideCodeTag = false;
            const node = getCurrent();
            node.content = escapeHtml(codeBuffer.join(""));
            codeBuffer.length = 0;
        }
        // 1. Set current node back to last parent
        //
        setCurrentBack();
    };

    const oncomment = (data: string) => {
        // 1. Create text node
        //
        const newCommentNode = {
            type: "comment",
            name: "#comment",
            attributes: {},
            content: data,
            children: [],
        };

        // 2. Add new node to current
        //
        const current = getCurrent();
        current["children"].push(newCommentNode);
    };

    const onprocessinginstruction = (name: string, data: string) => {
        // 1. Create text node
        //
        const newInstructionNode: Node = {
            type: "instruction",
            name: name, // TODO: ??
            attributes: {},
            children: [],
            content: data,
        };

        // 2. Add new node to current
        //
        const current = getCurrent();
        current["children"].push(newInstructionNode);
    };

    const onerror = (error: Error) => {
        error_ = error;
    };

    const parser = new Parser(
        {
            onopentag,
            ontext,
            onclosetag,
            oncomment,
            oncommentend: () => {},
            onprocessinginstruction,
            onend: () => {},
            onerror,
        }, // Options
        {
            decodeEntities: true,
            recognizeSelfClosing: true,
            lowerCaseTags: false,
        },
    );

    // Init
    setNewCurrent(root);

    // PARSER - html <NavTree children=[{"name":"Getting Started","id":"getting_started","link":"/getting_started","children":[{"name":"Foo","id":"getting_stared|foo","link":"/getting_stared/foo","children":[]},{"name":"Bar","id":"getting_stared|bar","link":"/getting_stared/bar","children":[]}]},{"name":"Installation","id":"installation","link":"/installation"}] />

    // Parse
    parser.write(html);
    parser.end();

    // Result
    return [root, error_];
}
