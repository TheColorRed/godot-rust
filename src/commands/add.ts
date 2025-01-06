import { addAsset } from '../helper/asset.js';
import { cargoAddDep, cargoAddGitDep } from '../helper/cargo.js';
import { error } from '../helper/cli-text.js';
import { hasFlag, showHelp } from '../helper/commands.js';
import { getGodotProjectRoot } from '../helper/exists.js';
import { getProject } from '../helper/project.js';
import { getTool, isTool } from '../helper/tools.js';

if (hasFlag('h')) {
  showHelp('Adds a tool to the current Rust project.', [
    {
      flag: '-p',
      description: 'The name of the project to add the tool to.',
      defaultValue: 'rust',
    },
    {
      flag: '-t',
      description: 'The tool to add to the project.',
    },
  ]);
}

const tool = await getTool();
if (!tool) {
  console.log(error('Could not find the requested tool'));
  process.exit(1);
}

try {
  if (isTool(tool)) {
    if (tool.type === 'crate') {
      const project = await getProject();
      if (!project) {
        console.log(error('Could not find the requested project'));
        process.exit(1);
      }
      if (tool.source && tool.options?.git?.url) await cargoAddGitDep(tool.source, project.path, tool.options);
      else if (tool.source) await cargoAddDep(tool.source, project.path);
    } else if (tool.type === 'asset') {
      const root = await getGodotProjectRoot(process.cwd());
      await addAsset(tool, root);
    } else if (tool.type === 'url') {
      // TODO: Implement URL tool adding
      console.log(error('URL tool adding is not yet implemented'));
    }
  }
} catch (e) {
  console.trace(e);
  console.log(error('No Rust project found in the current directory or parent directory'));
  process.exit(1);
}
