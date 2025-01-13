// Imports
//
import { mapCustomTags } from './mapper.ts';

// Test
// @ts-ignore
Deno.test('Test: Map User tag with slot', async () => {
	const html = `<User id="123">test</User>`;
	const want = `<div id="123">test</div>`;
	const customTags = {
		'User': './data/User.squirrel',
	};
	const context = {
		'Props': { 'id': '123', 'foo': 'bar' },
	};
	const got = await mapCustomTags(customTags, html, context);
	if (got.trim() != want.trim()) {
		throw new Error(`\nWant \n${want}\n, but got \n${got}`);
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
Deno.test('Test: Map User tag withOUT slot', async () => {
	const html = `<User id="123"></User>`;
	const want = `<div id="123"></div>`;
	const customTags = {
		'User': './data/User.squirrel',
	};
	const context = {
		'Props': { 'id': '123', 'foo': 'bar' },
	};
	const got = await mapCustomTags(customTags, html, context);
	if (got.trim() != want.trim()) {
		throw new Error(`\nWant \n${want}\n, but got \n${got}`);
	}
});
