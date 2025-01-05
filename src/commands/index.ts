#!/usr/bin/env node

import { closeReadline, createReadline, error } from '../helper/cli-text.js';

const command = process.argv[2] ?? '';

createReadline();

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
  default:
    console.log(error('Invalid command'));
    break;
}

closeReadline();
