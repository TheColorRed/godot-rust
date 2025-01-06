import { spawn } from 'node:child_process';

export type HelpItem = string | HelpObject;
export interface HelpObject {
  flag?: string;
  command?: string | string[];
  description: string;
  defaultValue?: string;
}

export const run = (cmd: string, args?: string[]): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args ?? [], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`Command failed with code ${code}`))));
  });

export const getFlag = (flag: string) =>
  process.argv.reduce<string | undefined>((acc, arg, index) => {
    if (arg === `-${flag}`) return process.argv[index + 1];
    return acc;
  }, undefined);

export const hasFlag = (flag: string) => {
  let regex = new RegExp(`-.*?${flag}`);
  return process.argv.some(arg => regex.test(arg));
};

/**
 * Show the help text for a command. This will also exit the process.
 * @param description The description of the command.
 * @param help The help text for the command.
 */
export function showHelp(description: string, help: string[] | HelpObject[]): void;
/**
 * Show the help text for a command. This will also exit the process.
 * @param help The help text for the command.
 */
export function showHelp(help: string | string[] | HelpObject[]): void;
export function showHelp(...args: [string, string[] | HelpObject[]] | [string | string[] | HelpObject[]]) {
  const description = typeof args[0] === 'string' ? args[0] : '';
  let helpMap = (typeof args[0] === 'string' ? args[1] : args[0]) ?? '';
  helpMap = Array.isArray(helpMap) ? helpMap : [helpMap];

  console.log(`\n  ${description}`);

  for (const helpItem of helpMap) {
    if (typeof helpItem === 'string') {
      console.log(helpItem);
    } else if (isHelpObject(helpItem)) {
      const command = Array.isArray(helpItem.command) ? helpItem.command.join('|') : helpItem.command;
      let value = Array(5).fill(' ').join('') + (helpItem.flag?.padEnd(20) ?? '');
      value = value.trim() === '' && command ? Array(5).fill(' ').join('') + (command?.padEnd(20) ?? '') : value;
      console.log(`${value} ${helpItem.description}`);
      if (helpItem.defaultValue) {
        console.log(
          `${Array(20 + 10)
            .fill(' ')
            .join('')}Default: ${helpItem.defaultValue}`
        );
      }
    }
  }

  process.exit(0);
}

function isHelpObject(help: HelpItem): help is HelpObject {
  if (typeof help === 'object' && ('flag' in help || 'command' in help)) {
    return true;
  }
  return false;
}
