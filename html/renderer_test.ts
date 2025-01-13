import { renderHtml } from './html_renderer.ts';

// Test
// @ts-ignore
Deno.test('transpile simple squirrel file to html', async () => {
	const tree = {
		root: {
			name: 'root',
			children: [
				{ name: 'div', attributes: {} },
			],
		},
	};
	const customTags = {};
	const want = `<div></div>`;

	const got = await renderHtml(tree, null, customTags);
	if (got.trim() !== want.trim()) {
		throw new Error(`Want ${want}, but got ${got}`);
	}
});
