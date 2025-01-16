import fs from 'node:fs/promises';
import path from 'node:path';
import { readCargoFile, saveCargoFile } from './cargo.js';
import { askFromSelection, askQuestion, defaultValue, error, info, success } from './cli-text.js';
import { run } from './commands.js';

export type ProjectType = 'game' | 'asset';

/**
 * Create a new project in the current directory.
 * @param rootDir The root directory of the project.
 * @param projectName The name of the project.
 */
export async function createRustProject(rootDir: string, projectName: string) {
  process.chdir(rootDir);
  console.log(info(`Creating new Rust project "${projectName}/rust"`));
  await run('cargo', ['new', 'rust', '--vcs', 'none', '--lib']);
  process.chdir('rust');
  console.log(info('Adding resolver = "2" to the Cargo.toml file'));
  let cargoToml = await readCargoFile('Cargo.toml');
  cargoToml.package!.name = projectName;
  cargoToml.lib = {
    'crate-type': ['cdylib'],
  };
  cargoToml.profile = {
    dev: {
      'opt-level': 1,
      package: {
        '*': {
          'opt-level': 3,
        },
      },
    },
  };
  await saveCargoFile('Cargo.toml', cargoToml);
  await run('cargo', ['add', 'godot']);
  await run('cargo', ['build']);
}
/**
 * Create a new GDExtension file.
 * @param rootDir The root directory of the project.
 * @param projectName The name of the project.
 * @param rustDir The directory of the Rust project.
 */
export async function createGdextension(rootDir: string, projectName: string, rustDir: string) {
  process.chdir(rootDir);

  console.log(info('Creating GDExtension: "rust.gdextension"'));
  await fs.writeFile(
    'rust.gdextension',
    `[configuration]
entry_symbol = "gdext_rust_init"
compatibility_minimum = 4.1
reloadable = true

[libraries]
linux.debug.x86_64 =     "res://${rustDir}/target/debug/lib${projectName}.so"
linux.release.x86_64 =   "res://${rustDir}/target/release/lib${projectName}.so"
windows.debug.x86_64 =   "res://${rustDir}/target/debug/${projectName}.dll"
windows.release.x86_64 = "res://${rustDir}/target/release/${projectName}.dll"
macos.debug =            "res://${rustDir}/target/debug/lib${projectName}.dylib"
macos.release =          "res://${rustDir}/target/release/lib${projectName}.dylib"
macos.debug.arm64 =      "res://${rustDir}/target/debug/lib${projectName}.dylib"
macos.release.arm64 =    "res://${rustDir}/target/release/lib${projectName}.dylib"`
  );
}
/**
 * Creates a new Godot project in the specified folder.
 * @param folder The folder to create the project in.
 */
export async function createGodotProject(folder: string) {
  console.log(info('Creating Godot project'));
  const file = path.join(folder, 'project.godot');
  await run('touch', [file]);
}
/**
 * Move files around to restructure the project.
 * @param projectName The name of the project.
 */
export async function moveFilesAround(projectName: string) {
  process.chdir('..');

  console.log(info('\nMoving files to a temporary folder'));
  const tmpDir = `./.tmp-${projectName}`;
  await fs.mkdir(tmpDir);
  await run(`mv`, ['-v', `./${projectName}/*`, `${tmpDir}/`]);
  await run(`mv`, ['-v', `./${projectName}/.godot`, `${tmpDir}/`]);

  console.log(info('\nMoving the temporary folder files into the newly created folder'));
  const projectGodotDir = path.join(projectName, 'godot');
  await fs.mkdir(projectGodotDir, { recursive: true });
  await run(`mv`, ['-v', `${tmpDir}/*`, `${projectGodotDir}/`]);
  await run(`mv`, ['-v', `${tmpDir}/.godot`, `${projectGodotDir}/`]);

  console.log(info('\nCleaning up the temporary folder'));
  await fs.rmdir(tmpDir, { recursive: true });
}
/**
 * Replaces the contents of the lib.rs file with the GDExtension template.
 * @param rootDir The root directory of the project containing the godot directory and the rust directory.
 */
export async function createExtensionLibraryFile(rootDir: string) {
  process.chdir(rootDir);

  await fs.writeFile(
    'rust/src/lib.rs',
    `use godot::prelude::*;

struct RustExtension;

#[gdextension]
unsafe impl ExtensionLibrary for RustExtension {}`
  );
}
/**
 * Get the project name from the user.
 * @param isExistingGodotProject Whether the project is an existing Godot project.
 */
export async function getProjectName(currentDir: string, isExistingGodotProject = false) {
  let projectName: string | undefined = undefined;
  // If the project is not an existing Godot project, ask the user for the project name
  if (!isExistingGodotProject) projectName = await askQuestion('Project name:');
  // If the project is an existing Godot project, use the current directory name as the project name
  // If the user wants to use a different name, ask them for the project name
  else {
    projectName = path.basename(currentDir);
    const projectInputName = await askQuestion(`Project name [${defaultValue(projectName)}]:`);
    if (projectInputName) projectName = projectInputName;
  }

  // Make sure the project name is not an empty string
  if (!projectName?.trim()) {
    console.log(error('Project name is required'));
    return getProjectName(currentDir);
  }

  if (projectName.includes(' ')) {
    console.log(error('Project name cannot contain spaces'));
    return getProjectName(currentDir);
  }

  return projectName;
}
export async function getProjectType() {
  return askFromSelection('What type of project is this?', [
    { name: 'Game', value: 'game' },
    { name: 'Asset', value: 'asset' },
  ]) as Promise<ProjectType | undefined>;
}
/**
 * Create a new Godot project in the specified folder.
 * @param projectName The name of the project.
 */
export function postCreateDocs(projectPath: string) {
  console.log(
    info(`
      Now that the project has been created, you need to finish the creation process in the Godot editor.

      1. Open Godot
      2. Click on "Import"
      3. Select the file "${success(projectPath)}"
    `)
  );
}
/**
 * Add git to the project.
 * @param projectPath The path to the project.
 */
export function createGitRepo(projectPath: string) {
  process.chdir(projectPath);
  console.log(info('Initializing git repository'));
  run('git', ['init']);
  run('touch', ['.gitignore']);
  fs.writeFile('.gitignore', 'target/');
  fs.appendFile('.gitignore', '\n.godot/');
}
