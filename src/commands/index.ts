#!/usr/bin/env node

import { error } from '../helper/cli-text.js';
import { hasFlag, showHelp } from '../helper/commands.js';

/** Whether the command is a command meaning it doesn't start with a dash. */
function isCommand(command: string): boolean {
  return !command.startsWith('-');
}

const command = process.argv[2] ?? '';
const hasHelp = hasFlag('h');

if ((!isCommand(command) && hasHelp) || command === 'help') {
  showHelp('Godot Rust CLI', [
    {
      command: 'new',
      description: 'Creates a new Godot project with Rust support.',
    },
    {
      command: 'convert',
      description: 'Converts an existing Godot project to support Rust.',
    },
    {
      command: 'add',
      description: 'Adds a new Rust tool to the project.',
    },
    {
      command: ['remove', 'rm'],
      description: 'Removes a Rust tool from the project.',
    },
  ]);
}

let file = '';
/* prettier-ignore */
switch (command.trim()) {
  case 'new': file = './new.js'; break;
  case 'convert': file = './convert.js'; break;
  case 'add': file = './add.js'; break;
  case 'remove':
  case 'rm': file = './remove.js'; break;
  default:
    console.log(error('Invalid command'));
    process.exit(1);
}

await import(file);
