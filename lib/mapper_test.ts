// Imports
//
import { mapCustomTags } from "./mapper.ts"
import { mapAttributes } from "./mapper.ts"

// Test
// @ts-ignore
Deno.test("Test: Map User tag with slot", async () => {
    const html = `<User id="123">test</User>`
    const want = `<div id="123">test</div>`
    const customTags = {
        "User": "./data/User.squirrel"
    }
    const context = {
        "Props": { "id": "123", "foo": "bar" }
    }
    const got = mapCustomTags(customTags, html, context);
    if (got.trim() != want.trim()) {
        throw new Error(`\nWant \n${want}\n, but got \n${got}`)
    }

    /*
    <User id="1" foo ="bar">foo</User>
    <TAG  PROPS>CONTENT></TAG>

    --
    const { id, foo } = Component.Props;
    const { content } = Component.Content;
    --
    <div id="${id}" foo="${foo}">
        ${content}
    </div>
     */

});

// Test
// @ts-ignore
Deno.test("Test: Map User tag withOUT slot", () => {
    const html = `<User id="123"></User>`
    const want = `<div id="123"></div>`
    const customTags = {
        "User": "./data/User.squirrel"
    }
    const context = {
        "Props": { "id": "123", "foo": "bar" }
    }
    const got = mapCustomTags(customTags, html, context);
    if (got.trim() != want.trim()) {
        throw new Error(`\nWant \n${want}\n, but got \n${got}`)
    }
});

// Test
// @ts-ignore
Deno.test("Test: Map attributes", async () => {
    const attributes: Record<string, any> = {
        "id": 123,
        "foo": "bar",
    }
    const want = 'id="123" foo="bar"'
    const got = mapAttributes(attributes);
    if (got.trim() != want.trim()) {
        throw new Error(`\nWant \n${want}\n, but got \n${got}`)
    }
});
