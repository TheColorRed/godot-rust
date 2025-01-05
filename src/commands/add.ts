import { cargoAdd, cargoPackagePath } from '../helper/cargo.js';
import { askQuestion, error } from '../helper/cli-text.js';
import { getFlag, hasFlag, showHelp } from '../helper/commands.js';
import { getCargoFiles } from '../helper/exists.js';

import { dirname } from 'node:path';
import { Database } from '../types.js';

const CURRENT_DIR = process.cwd();

const projectName = getFlag('p');
const hasHelp = hasFlag('h');
const databaseUrl = 'https://raw.githubusercontent.com/TheColorRed/godot-rust/refs/heads/main/assets/tool-db.json';
const database: Database[] = await fetch(databaseUrl).then(r => r.json());

function listKnownTools() {
  console.log('Known tools:');
  for (const tool of database) {
    console.log(`  - ${tool.name}`);
  }
}

async function getTool(count = 0) {
  const message = 'What tool would you like to add to the project?';
  tool = await askQuestion(`${message} ${count == 0 ? '(type "list" to show know tools)' : ''}`.trim());
  if (tool === 'list') {
    listKnownTools();
    await getTool(count + 1);
  }
}

let tool = getFlag('t');
if (!tool) {
  await getTool(0);
}

if (hasHelp) {
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

try {
  const files = await getCargoFiles(CURRENT_DIR);

  const cargoPackage = await cargoPackagePath(projectName ?? 'rust', files);
  if (!cargoPackage) {
    console.log(error(`No package found with the name "${projectName}"`));
    process.exit(1);
  }

  // Check if the tool is a URL
  if (tool?.match(/https?:\/\//)) {
    // TODO: Implement URL tool adding
  }
  // The tool is possibly in the database, let's add it
  else {
    // Search the database for the tool
    let toolToAdd = database.find(d => d.name === tool);
    if (!toolToAdd) {
      console.log(error(`No tool found with the name "${tool}"`));
      process.exit(1);
    }

    if (toolToAdd.type === 'crate') {
      await cargoAdd(toolToAdd.source, dirname(cargoPackage));
    } else if (toolToAdd.type === 'url') {
      // TODO: Implement URL tool adding
    }
  }
} catch (e) {
  console.trace(e);
  console.log(error('No Rust project found in the current directory or parent directory'));
  process.exit(1);
}
