import { DatabaseTool } from '../types.js';
import { cargoPackageInfo } from './cargo.js';
import { getSelectionList } from './cli-text.js';
import { getFlag } from './commands.js';
import { getCargoFiles } from './exists.js';
import { getDatabaseTools } from './tools.js';
/**
 * A Cargo package object from a Cargo.toml file.
 */
export interface CargoPackage {
  /** The package object. */
  package?: {
    /** The name of the package. */
    name?: string;
    /** The version of the package. */
    version?: string;
  };
  /** The dependencies of the package. */
  dependencies?: { [key: string]: string };
  /** Workspace information. */
  workspace?: { members: string[] };
}

export type CargoPackageInfo = {
  path: string;
  parsed: CargoPackage;
};

export type CargoPackagesInfo = {
  [key: string]: CargoPackageInfo;
};
/**
 * Select a project from a list of cargo projects.
 */
export async function selectProject() {
  const projects = await getCargoFiles(process.cwd());
  const projectInfo = Object.assign({}, await cargoPackageInfo(projects));
  return await getSelectionList(
    'What project would you like to use?',
    Object.entries(projectInfo).map(([name, info]) => ({ name, value: info }))
  );
}
/**
 * Select a dependency from a project.
 * @param project The project to select the dependency from.
 * @param onlyInDatabase Only show dependencies that are in the database.
 */
export async function selectProjectDependency(project: string, onlyInDatabase: boolean): Promise<DatabaseTool | undefined> {
  const projectInfo = await findProjectByName(project);
  const database = await getDatabaseTools();
  const dependencies = Object.keys(projectInfo?.parsed.dependencies ?? {})
    .map(id => database.find(d => d.id === id) ?? database.find(d => d.type === 'crate' && d.source === id))
    .filter(i => (onlyInDatabase ? database.some(d => d.id === i?.id) : true))
    .map(d => ({ name: d?.name ?? '', value: d }));
  return await getSelectionList('What dependency would you like to use?', dependencies);
}
/**
 * Get the current project passed in from the `-p` flag or shows a selection prompt.
 */
export async function getProject() {
  let project: string | undefined = getFlag('p');
  if (!project) {
    return await selectProject();
  } else {
    return await findProjectByName(project);
  }
}
/**
 * Find a project by name.
 * @param name The name of the project to find.
 */
export async function findProjectByName(name: string): Promise<CargoPackageInfo | undefined> {
  const projects = await getCargoFiles(process.cwd());
  const projectInfo = Object.assign({}, await cargoPackageInfo(projects)) as CargoPackagesInfo;
  return projectInfo[name];
}
/**
 * Check if the project is a valid project object.
 * @param project The project to check.
 */
export function isProject(project: string | CargoPackageInfo | undefined): project is CargoPackageInfo {
  return (project as CargoPackageInfo).parsed !== undefined;
}
