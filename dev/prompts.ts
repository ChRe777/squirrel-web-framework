import prompts from 'npm:prompts';
import figlet from 'https://x.nest.land/deno-figlet@0.0.5/mod.js';

function fi(x: string) {
	return figlet(x);
}

const text = await fi('text');
console.log(text);
const padding = '  ';

const response = await prompts({
	type: 'number',
	name: 'value',
	message: padding + 'How old are you?',
	validate: (value: number) => value < 18 ? `This games is 13+ only` : true,
});

console.log('foo');
console.log(response); // => { value: 24 }

//prompts.inject(["@terkelg", ["#ff0000", "#0000ff"]]);

const response2 = await prompts([
	{
		type: 'text',
		name: 'twitter',
		message: `What's your twitter handle?`,
	},
	{
		type: 'multiselect',
		name: 'color',
		message: 'Pick colors',
		choices: [
			{ title: 'Red', value: '#ff0000' },
			{ title: 'Green', value: '#00ff00' },
			{ title: 'Blue', value: '#0000ff' },
		],
	},
]);

// => { twitter: 'terkelg', color: [ '#ff0000', '#0000ff' ] }

console.log(response2);

// Explicit call exit otherwise readline still waits for input
Deno.exit(0);
