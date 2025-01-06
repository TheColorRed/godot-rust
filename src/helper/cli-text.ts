import chalk from 'chalk';
import inquirer from 'inquirer';

const theme = {
  defaultValue: '#8a8a8a',
  info: '#75baff',
  success: '#6cfc47',
  error: '#ff3d3d',
  warning: '#ff9f3d',
};

/**
 * Display a success message.
 * @param text The text to display.
 */
export const success = (text: string) => chalk.hex(theme.success)(text);
/**
 * Display an info message.
 * @param text The text to display.
 */
export const info = (text: string) => chalk.hex(theme.info)(text);
/**
 * Display a default value.
 * @param text The text to display.
 */
export const defaultValue = (text: string) => chalk.hex(theme.defaultValue)(text);
/**
 * Display an error message.
 * @param text The text to display.
 */
export const error = (text: string) => chalk.hex(theme.error)(text);
/**
 * Display a warning message.
 * @param text The text to display.
 */
export const warning = (text: string) => chalk.hex(theme.warning)(text);
/**
 * Ask a question to the user.
 * @param message The question to ask.
 */
export async function askQuestion(message: string): Promise<string | undefined> {
  try {
    const response = await inquirer.prompt({ name: 'question', message, type: 'input' });
    return response.question ?? '';
  } catch {
    return undefined;
  }
}
/**
 * Show a selection prompt to the user.
 * @param message The message to display.
 * @param choices The choices to select from.
 * @param pageSize The number of choices to display per page. Defaults to 10.
 */
export async function getSelectionList<T, U extends { name: string; value: T }>(message: string, choices: U[], pageSize = 10) {
  try {
    const response = await inquirer.prompt({ name: 'question', message, type: 'list', choices, pageSize });
    return response.question as U['value'];
  } catch {
    return undefined;
  }
}
