# Colored CLI

Creating a colored CLI install script similar to npm create astro involves
leveraging libraries or techniques that allow terminal text formatting. Below is
a step-by-step guide for creating one:

## Choose a Programming Language

Typically, these scripts are written in: •	Node.js: Using packages like chalk or
kleur. •	Python: Using libraries like rich or colorama. •	Bash: Using ANSI
escape codes for colors.

For this example, I’ll use Node.js with chalk, as it’s common in the JavaScript
ecosystem.

## Install Chalk

Install the chalk package to manage colored text output.

npm install chalk

## Create the Script

Below is an example install.js script:

#!/usr/bin/env node

import chalk from 'chalk'; import readline from 'readline';

// Utility for a clear line prompt const prompt = readline.createInterface({
input: process.stdin, output: process.stdout, });

console.clear();

// Colored banners console.log(chalk.blue.bold('Welcome to My CLI Installer!'));
console.log(chalk.green('This script will guide you through the setup
process.')); console.log();

// Interactive input prompt.question(chalk.yellow('What is your project name?
'), (projectName) => {
console.log(chalk.cyan(`Creating a new project: ${projectName}`));

// Simulating progress console.log(chalk.green('\nInstalling dependencies...'));
setTimeout(() => { console.log(chalk.greenBright('Dependencies installed
successfully!')); console.log(chalk.magentaBright('\nSetup complete. Happy
coding!')); prompt.close(); }, 2000); });

4. Add Interactivity

You can add prompts using readline (shown above) or use advanced tools like:
•	inquirer for multiple-choice questions. •	ora for spinners/progress
indicators.

Example with inquirer:

import inquirer from 'inquirer'; import chalk from 'chalk';

console.clear();

console.log(chalk.blue.bold('Welcome to My CLI Installer!'));

inquirer .prompt([ { type: 'input', name: 'projectName', message: 'What is your
project name?', }, { type: 'list', name: 'framework', message: 'Select a
framework:', choices: ['React', 'Vue', 'Svelte', 'Next.js'], }, ])
.then((answers) => {
console.log(chalk.cyan(`\nCreating project: ${answers.projectName}`));
console.log(chalk.yellow(`Using framework: ${answers.framework}`));

    // Simulating setup
    console.log(chalk.green('\nSetting up your project...'));
    setTimeout(() => {
      console.log(chalk.greenBright('Setup complete!'));
    }, 2000);

});

5. Make the Script Executable

Add a “shebang” line (#!/usr/bin/env node) to the top of the script so it can be
executed directly.

Then, make the script executable:

chmod +x install.js

6. Distribute the CLI

To distribute the script as a global CLI tool: 1.	Add a bin field to your
package.json:

{ "name": "my-cli", "version": "1.0.0", "bin": { "my-cli": "./install.js" } }

    2.	Publish to npm:

npm publish

    3.	Users can install it globally:

npm install -g my-cli

Now, users can run your script via my-cli in their terminal.

7. Add Fancy Features

To further enhance the script: •	Use animations with ora. •	Add banners or art
with figlet. •	Include additional tools like shelljs for automating file system
tasks.

This setup replicates what npm create astro and similar tools offer.
