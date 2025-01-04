#!/usr/bin/env node

import { error, rl } from '../helper/cli-text.js';

const command = process.argv[2] ?? '';

switch (command.trim()) {
  case 'new':
    await import('./new.js');
    break;
  case 'convert':
    await import('./convert.js');
    break;
  default:
    console.log(error('Invalid command'));
    break;
}

rl.close();
