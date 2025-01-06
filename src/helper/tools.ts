import { DatabaseTool } from '../types.js';
import { askQuestion, getSelectionList } from './cli-text.js';
import { getFlag } from './commands.js';

/** The URL of the tool database. */
const DATABASE_TOOLS_URL = 'https://raw.githubusercontent.com/TheColorRed/godot-rust/refs/heads/main/assets/tool-db.json';
/**
 * Get the data in the tool database.
 */
export async function getDatabaseTools(): Promise<DatabaseTool[]> {
  return fetch(DATABASE_TOOLS_URL).then(r => r.json());
}
/**
 * Shows a selection prompt for the user to select a tool.
 */
export async function selectTool() {
  const tools = (await getDatabaseTools()).map(d => ({ name: d.name, value: d })).sort((a, b) => a.value.name.localeCompare(b.value.name));
  return getSelectionList('What tool would you like to use?', tools);
}
/**
 * Get the current tool passed in from the `-t` flag or shows a selection prompt.
 */
export async function getTool() {
  let tool: string | DatabaseTool | undefined = getFlag('t');
  if (!tool) {
    tool = (await selectTool()) ?? '';
    if (typeof tool === 'string' && tool?.toLowerCase() === 'url') {
      tool = await askQuestion('Enter the URL of the tool');
    }
  }
  return tool;
}
/**
 * Check if the tool is a valid tool object.
 * @param tool The tool to check.
 */
export function isTool(tool: string | DatabaseTool): tool is DatabaseTool {
  return (tool as DatabaseTool).name !== undefined;
}
