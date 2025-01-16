import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import { askQuestion, error, info, success } from '../helper/cli-text.js';
import { hasFlag, showHelp } from '../helper/commands.js';
import {
  createExtensionLibraryFile,
  createGdextension,
  createGitRepo,
  createGodotProject,
  createRustProject,
  getProjectName,
  getProjectType,
  postCreateDocs,
  ProjectType,
} from '../helper/create-project.js';
import { checkIfExists, isCargoInstalled, isGitInstalled, isGodotCLIInstalled, isGodotProjectDirectory } from '../helper/exists.js';

/**
 * Create a new project in the current directory.
 * @param projectName The name of the project.
 * @returns A promise that resolves when the project is created.
 */
async function createNew(projectName: string, projectType: ProjectType, dirname: string) {
  const projectSrc = path.join(projectName, 'godot');

  console.log(info('Creating project folder structure'));
  await fs.mkdir(projectSrc, { recursive: true });

  await createGodotProject(path.join(dirname, projectName, 'godot'));
  await createGdextension(path.join(dirname, projectName, 'godot'), projectName, '../rust');
  await createRustProject(path.join(dirname, projectName), projectName);
  await createExtensionLibraryFile(path.join(dirname, projectName));
}

// Show help if the user passes the -h flag
if (hasFlag('h')) {
  showHelp('Creates a new Godot project with Rust support.', []);
}

// Check if Cargo is installed as it's required to create a new project
// If it's not installed, show an error message and exit
const cargoInstalled = await isCargoInstalled();
if (!cargoInstalled) {
  console.log(error('Cargo is not installed'));
  console.log(info('Please install Rust and Cargo before creating a new project'));
  console.log(info('You can install Rust and Cargo from https://www.rust-lang.org/tools/install'));
  process.exit(1);
}

// Check if a Godot project already exists in the current directory
// If it does, show an error message and exit
const CURRENT_DIR = process.cwd();
const exists = await isGodotProjectDirectory(CURRENT_DIR);
if (exists) {
  console.log(error('A Godot project already exists in the current directory'));
  console.log(info('Either use a directory that doesn\'t contain a project or run the "convert" command'));
  process.exit(1);
}

// Get the project name from the user
// Then check if a folder with the same name already exists
// If it does, show an error message and exit
const projectName = await getProjectName(CURRENT_DIR);
const folderExists = await checkIfExists(projectName);
if (folderExists) {
  console.log(error('A folder with the same name already exists'));
  process.exit(1);
}

// Get the project type from the user
// This can either be a "game" or an "asset"
// If the user doesn't provide a type, default to "game"
// Then create the new project
const projectType = (await getProjectType()) ?? 'game';
await createNew(projectName, projectType, CURRENT_DIR);
console.log(success('Godot Rust project created!'));

// Check to see if Git is installed
// If it is, ask the user if they want to initialize a Git repository
const isGit = await isGitInstalled();
if (isGit) {
  const addGit = await askQuestion('Do you want to initialize this a git repository? [y/n]');
  if (addGit && addGit.toLocaleLowerCase() === 'y') createGitRepo(path.join(CURRENT_DIR, projectName));
}

const location = path.join(CURRENT_DIR, projectName, 'godot', 'project.godot');

// Check if we can execute the Godot from the command line
// If we can, ask the user if they want to open the project in Godot
// If they do, open the project in Godot
// Otherwise, show the steps to finish the project creation in the Godot editor
const godotCLIExists = await isGodotCLIInstalled();
if (godotCLIExists) {
  const openGodot = await askQuestion('Do you want to open the project in Godot? [y/n]');
  if (openGodot?.toLowerCase() === 'y') {
    const openProject = path.join(CURRENT_DIR, projectName, 'godot/project.godot');
    console.log(info(`Opening the project in Godot: "${openProject}"`));
    const child = spawn(`godot`, [openProject], { detached: true, stdio: 'ignore' });
    child.unref();
  } else {
    postCreateDocs(location);
  }
} else {
  postCreateDocs(location);
}
