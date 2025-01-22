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
 * Check if Cargo is installed.
 */
export async function isCargoInstalled() {
  try {
    await run('cargo', ['--version']);
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
export async function getGodotProjectRoot(projectDir: string) {
  if (await isGodotProjectDirectory(projectDir)) return projectDir;
  const files = await getFiles('**/project.godot', projectDir);
  if (files.length > 0) return path.dirname(files[0]);
  else return await getGodotProjectRoot(path.resolve(projectDir, '..'));
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
/**
 * Gets a list of files that match a pattern.
 * @param pattern The pattern to search for.
 * @param cwd The root directory to search in.
 * @param absolute Whether to return absolute paths. Defaults to `true`.
 */
export async function getFiles(pattern: string, cwd: string, absolute = true) {
  return fg.async(pattern, { cwd, onlyFiles: true, absolute });
}

export async function getDirectories(pattern: string, cwd: string, absolute = true) {
  return fg.async(pattern, { cwd, onlyDirectories: true, absolute });
}
