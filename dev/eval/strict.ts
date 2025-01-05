'use strict';

let localVar = 'I am a local variable';
import { greet } from "./greet.ts";

console.log(typeof greet);

const fn = new Function('fn', `
  let localVar = 'I am overwritten';  // This works only inside eval.
  console.log(fn());  // Outputs: 'I am overwritten'
  return localVar;
`);

console.log(fn(greet));  // Outputs: 'I am a local variable' (global scope remains unchanged)
