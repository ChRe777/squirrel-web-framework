// ----------------------------------------------------------------------------

// Imports
//
import { figlet } from "./deps.ts";
import { chalk } from "./deps.ts";
import { prompts } from "./deps.ts";
import { shelljs } from "./deps.ts";

// Shortcuts
//
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
//
const bblue = chalk.blue.bold;
const bred = chalk.red.bold;
const bgreen = chalk.green.bold;
//
const green = chalk.green;
const red = chalk.red;
const blue = chalk.blue;

// ----------------------------------------------------------------------------

async function showTitle() {
  const squirrel = await figlet("S Q U I R R E L");
  console.log();
  console.log(bblue(squirrel));
  console.log(bblue("Welcome to the Squirrel Installer!"));
  console.log(
    green("This script will guide you through the setup process."),
  );
  console.log();
}

async function askQuestions(): Promise<object> {
  const TEMPLATES = [
    { title: "Empty (recommended)", value: "empty" },
    { title: "Blog template", value: "blog" },
    { title: "Documentation template", value: "docu" },
  ];

  const questions = [
    {
      type: "text",
      name: "targetFolder",
      message: "Location of your new squirrel project?",
      initial: "./foo",
    },
    {
      type: "select",
      name: "template",
      message: "Pick a project template",
      choices: TEMPLATES,
      initial: 0,
    },
    {
      type: "toggle",
      name: "initGit",
      message: "Initialize a new git repository?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
  ];

  const response = await prompts(questions);
  return response;
}

async function giveInformation(response: any) {
  console.log(bblue("Congratulation!"));
  await delay(777);

  console.log(bblue("You are now ready to start with you project"));
  await delay(500);
  console.log(
    "Now enter " + bgreen(`> cd ${response.targetFolder}`) +
      " to change project folder",
  );
  await delay(500);
  console.log(
    "and then type " + bgreen(`> deno task start`) + " to start server",
  );
  console.log(
    "You can see your website on " + bgreen("http://localhost:8000/"),
  );
  await delay(500);
  console.log(bred("Enjoy!"));
  Deno.exit();
}

function doInstallation(props: any) {
  const { targetFolder, template, initGit } = props;

  function gitInit() {
    console.log("Initializing Git repository...");
    if (shelljs.cd(targetFolder).exec("git init").code !== 0) {
      console.error(bred("Error: Failed to initialize git repository"));
      Deno.exit(1); // Exit if git init fails
    } else {
      console.log("Git repository initialized successfully");
    }
  }

  function cloneTemplate() {
    const repoUrl =
      `https://github.com/squirrel/squirrel-${template}-template.git`;
    console.log("Cloning repository...");

    if (shelljs.exec(`git clone ${repoUrl} ${targetFolder}`).code !== 0) {
      console.error(bred("Error: Failed to clone the repository"));
      Deno.exit(1); // Exit if clone fails
    } else {
      console.log(`Repository cloned into ${targetFolder}`);

      // Remove git-folders
      shelljs.rm("-rf", `${targetFolder}/.git*`);
    }
  }

  function createFolder() {
    if (shelljs.mkdir("-p", targetFolder).code !== 0) {
      console.error("Error: Failed to create directory");
      Deno.exit(1);
    }
  }

  function checkGitExists() {
    if (shelljs.which("git")) {
      console.log("Git is installed");
    } else {
      console.log("Git is not installed");
      Deno.exit(1);
    }
  }

  // Requirements
  //
  console.log(bblue("Start installation ..."));

  // Step R: Check if a git command is available
  //
  checkGitExists();

  // Step 0: Create project location
  //
  createFolder();

  // Step 1: Clone the repository into the target folder
  //
  cloneTemplate();

  // Step 2: Initialize a new Git repository in the target folder (git init)
  //
  if (initGit) {
    gitInit();
  }
}

// ----------------------------------------------------------------------------

// Step R: Init
//
console.clear();

// Step 0: Title
//
await showTitle();

// Step 1: Ask user questions
//
const answers = await askQuestions();

// Step 2: Actions to installation
//
doInstallation(answers);

// Step 3: Information after installation
//
await giveInformation(answers);

// ----------------------------------------------------------------------------
