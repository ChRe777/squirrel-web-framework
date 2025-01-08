import { parse } from "https://denopkg.com/ThauEx/deno-fast-xml-parser/mod.ts";

const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "#attr",
    ignoreAttributes: false,
    arrayMode: true, //"strict"
    trimValues: false,
}

const parsed = parse(
    `<test id="123">
        foo bar
        <span id="1" class="foo">test</span>
        biz
        <br />
    </test>`,
    options
);
console.log(parsed);

// var tObj = parser.getTraversalObj(xmlData,options);
// { test:
//  {
//      "#text": "foo barbiz",
//      span: "test"
//  }
// }
