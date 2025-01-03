// Imports
//
import { render, html, signal, detach } from 'https://cdn.jsdelivr.net/npm/uhtml/preactive.js';

// Constants
//
const count = signal(0);
const id = "button2";

render(document.getElementById(id), () => html`
  <button class="btn btn-primary" onclick=${() => { count.value++ }}>
    Clicks: ${count.value}
  </button>
`);

// stop reacting to signals in the future
setTimeout(() => {
    detach(document.body);
}, 10000);
