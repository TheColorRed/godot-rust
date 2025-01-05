import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { run } from './commands.js';

/**
 * Check if the Godot CLI exists.
 */
export async function isGodotCLIInstalled() {
  try {
    await run('godot', ['--version']);
    return true;
  } catch {
    return false;
  }
}
/**
 * Check if Git is installed.
 */
export async function isGitInstalled() {
  try {
    await run('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}
/**
 * Check if a folder is a Godot project directory.
 * @param projectDir The project directory to check.
 */
export async function isGodotProjectDirectory(projectDir: string) {
  try {
    await fs.access(path.join(projectDir, 'project.godot'), fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
/**
 * Gets the current project location of where the command is run.
 * @param projectDir The project directory to check.
 */
export async function getCargoFiles(projectDir: string) {
  const pattern = '**/Cargo.toml';
  let files = await getFiles(pattern, projectDir);
  if (files.length === 0) {
    files = files.concat(await getFiles(pattern, path.resolve(projectDir, '..')));
  }
  return files;
}
/**
 * Check if a folder exists.
 * @param folder The folder to check.
 */
export async function checkIfExists(folder: string) {
  try {
    await fs.access(folder, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getFiles(pattern: string, root: string) {
  return fg.async(pattern, { cwd: root, onlyFiles: true, absolute: true });
}
