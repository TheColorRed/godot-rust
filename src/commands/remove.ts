import { cargoRemoveDep } from '../helper/cargo.js';
import { error } from '../helper/cli-text.js';
import { hasFlag, showHelp } from '../helper/commands.js';
import { getProject, isProject, selectProjectDependency } from '../helper/project.js';

if (hasFlag('h')) {
  showHelp('Removes a Rust tool from the project. (Currently only supports removal of crates)', [
    {
      flag: '-p',
      description: 'The name of the project to remove the tool from.',
    },
  ]);
}

const project = await getProject();
if (!isProject(project)) {
  console.log(error('Could not find the requested project'));
  process.exit(1);
}

const dep = await selectProjectDependency(project.parsed.package?.name ?? '', true);

if (dep && dep.type === 'crate') {
  if (dep.source) await cargoRemoveDep(dep.source, project.path);
}
