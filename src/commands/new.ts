import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import { askQuestion, error, info, success } from '../helper/cli-text.js';
import {
  createGdextension,
  createGitRepo,
  createGodotProject,
  createRustProject,
  getProjectName,
  postCreateDocs,
  writeLibRs,
} from '../helper/create-project.js';
import { checkIfExists, isGitInstalled, isGodotCLIInstalled, isGodotProjectDirectory } from '../helper/exists.js';

const CURRENT_DIR = process.cwd();
const exists = await isGodotProjectDirectory(CURRENT_DIR);

if (exists) {
  console.log(error('A Godot project already exists in the current directory'));
  console.log(info('Either use a directory that doesn\'t contain a project or run the "convert" command'));
  process.exit(1);
}

/**
 * Create a new project in the current directory.
 * @param projectName The name of the project.
 * @returns A promise that resolves when the project is created.
 */
export async function createNew(projectName: string) {
  const projectSrc = path.join(projectName, 'godot');

  console.log(info('Creating project folder structure'));
  await fs.mkdir(projectSrc, { recursive: true });

  await createGodotProject(path.join(CURRENT_DIR, projectName, 'godot'));
  await createGdextension(path.join(CURRENT_DIR, projectName, 'godot'), projectName, '../rust');
  await createRustProject(path.join(CURRENT_DIR, projectName), projectName);
  await writeLibRs(path.join(CURRENT_DIR, projectName));
}

const projectName = await getProjectName(CURRENT_DIR);
const folderExists = await checkIfExists(projectName);

if (folderExists) {
  console.log(error('A folder with the same name already exists'));
  process.exit(1);
}

await createNew(projectName);
console.log(success('Godot Rust project created!'));

// Check to see if Git is installed and ask the user if they want to initialize a repository
const isGit = await isGitInstalled();
if (isGit) {
  const addGit = await askQuestion('Do you want to initialize this a git repository? [y/n]');
  if (addGit.toLocaleLowerCase() === 'y') createGitRepo(path.join(CURRENT_DIR, projectName));
}

const location = path.join(CURRENT_DIR, projectName, 'godot', 'project.godot');

// Check if the Godot CLI is installed and ask the user if they want to open the project in Godot
// If they choose not to, show them the post-create instructions
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
