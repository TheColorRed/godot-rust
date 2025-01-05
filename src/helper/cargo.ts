import * as fs from 'fs/promises';
import { parse } from 'ini';
import { run } from './commands.js';

export async function cargoWorkspacePath(paths: string[] | string) {
  paths = Array.isArray(paths) ? paths : [paths];
  for (const path of paths) {
    let content = await fs.readFile(path, 'utf-8');
    let parsed = parse(content);
    if (parsed?.workspace) {
      return path;
    }
  }
}

export async function cargoPackagePath(name: string, paths: string[] | string) {
  paths = Array.isArray(paths) ? paths : [paths];
  for (const path of paths) {
    let content = await fs.readFile(path, 'utf-8');
    let parsed = parse(content);
    const packageName = parsed?.package?.name;
    if (packageName === name) {
      return path;
    }
  }
}

export async function cargoAdd(packageName: string, packagePath: string) {
  process.chdir(packagePath);
  await run('cargo', ['add', packageName]);
}
