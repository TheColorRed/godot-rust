#!/usr/bin/env node

import { error } from '../helper/cli-text.js';
import { hasFlag, showHelp } from '../helper/commands.js';

function isCommand(command: string): boolean {
  return !command.startsWith('-');
}

const command = process.argv[2] ?? '';
const hasHelp = hasFlag('h');

if (!isCommand(command) && hasHelp) {
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

switch (command.trim()) {
  case 'new':
    await import('./new.js');
    break;
  case 'convert':
    await import('./convert.js');
    break;
  case 'add':
    await import('./add.js');
    break;
  case 'remove':
  case 'rm':
    await import('./remove.js');
    break;
  default:
    console.log(error('Invalid command'));
    break;
}
