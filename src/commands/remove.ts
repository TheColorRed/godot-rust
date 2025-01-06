import { cargoRemoveDep } from '../helper/cargo.js';
import { error } from '../helper/cli-text.js';
import { getProject, isProject, selectProjectDependency } from '../helper/project.js';

const project = await getProject();
if (!isProject(project)) {
  console.log(error('Could not find the requested project'));
  process.exit(1);
}

const dep = await selectProjectDependency(project.parsed.package?.name ?? '', true);

if (dep && dep.type === 'crate') {
  if (dep.source) await cargoRemoveDep(dep.source, project.path);
}
