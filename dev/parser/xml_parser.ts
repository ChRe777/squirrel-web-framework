import { XMLParser } from "https://deno.land/x/fast_xml_parser/mod.ts";

const xmlData = `<note>
                  <to>Tove</to>
                  <from>Jani</from>
                  <heading>Reminder</heading>
                  <body>Don't forget me this weekend!</body>
                </note>`;

const parser = new XMLParser();
const jsonObj = parser.parse(xmlData);
console.log(jsonObj);
