#!/usr/bin/env node

import path from 'path';
import { askQuestion, error, info, rl, success, warning } from '../helper/cli-text.js';
import { createGdextension, createRustProject, getProjectName, moveFilesAround, writeLibRs } from '../helper/create-project.js';
import { isGodotProjectDirectory } from '../helper/exists.js';

const CURRENT_DIR = process.cwd();
const exists = await isGodotProjectDirectory(CURRENT_DIR);

if (!exists) {
  console.log(error('No Godot project found in the current directory'));
  console.log(info('Either use a directory that contains a project or run the "new" command'));
  process.exit(1);
}

/**
 * Add a new rust project to the current directory.
 * @param projectName The name of the project.
 */
export async function addProject(projectName: string) {
  console.log('Adding project to the current directory');
  await createGdextension(CURRENT_DIR, projectName, 'rust');
  await createRustProject(path.join(CURRENT_DIR, 'rust'), projectName);
  await writeLibRs(CURRENT_DIR);
  console.log(success('\nDone!'));
}
/**
 * Restructure the project in the current directory.
 * @param projectName The name of the project.
 */
export async function restructureProject(projectName: string) {
  console.log(warning('It is recommended to backup your project with version control before proceeding.'));
  const proceed = await askQuestion('Are you sure you want to continue? [y/n]');

  if (proceed?.toLowerCase() === 'y') {
    console.log(info('Restructuring the project'));
    await moveFilesAround(projectName);
    await createGdextension(path.join(CURRENT_DIR, 'godot'), projectName, '../rust');
    await createRustProject(CURRENT_DIR, projectName);
    await writeLibRs(CURRENT_DIR);
    console.log(success('Done!'));
  } else {
    console.log(error('Aborting'));
    process.exit(1);
  }
}

// If the .godot folder exists, we can assume that this is a Godot project
console.log(success('Found project file!'));
const projectName = await getProjectName(CURRENT_DIR, true);

// Ask the user if they want to add the project to the current directory or restructure it
const answer = await askQuestion('Do you want to add (A) the project to the current directory or restructure (R) it? [a/r]');

if (answer?.toLowerCase() === 'a') await addProject(projectName);
else if (answer?.toLowerCase() === 'r') restructureProject(projectName);
else console.log(error('Invalid input, please either enter "a" to add or "r" to restructure the project'));

rl.close();
