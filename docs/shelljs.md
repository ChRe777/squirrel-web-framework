const shell = require('shelljs');

// Run a simple shell command shell.echo('Hello, world!');

// Check if a command is available if (shell.which('git')) { console.log('Git is
installed'); } else { console.log('Git is not installed'); }

// Run a shell command shell.exec('git clone https://github.com/some/repo.git');
