import { Presets, SingleBar } from 'npm:cli-progress';

import * as foo from 'npm:cli-progress';
console.log(foo);

const bar = new SingleBar({
	format: '{bar} | {percentage}% | {value}/{total} Typewriting...',
	barCompleteChar: '=',
	barIncompleteChar: ' ',
}, Presets.shades_classic);

bar.start(100, 0);

// Simulate a typewriter effect with progress
let i = 0;
const message = 'Hello, this is a typewriter effect!';
const typingInterval = setInterval(() => {
	process.stdout.write(message[i]);
	i++;
	bar.update(i);

	if (i === message.length) {
		clearInterval(typingInterval);
		bar.stop();
		console.log('\nFinished typing!');
	}
}, 100);
