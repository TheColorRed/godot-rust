import { error } from 'console';
import { createWriteStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { dirname } from 'path';
import * as yauzl from 'yauzl';
import { DatabaseTool } from '../types.js';
import { getDirectories } from './exists.js';
/**
 * Moves a directory and all of its contents to a new location.
 * @param source The source directory.
 * @param destination The destination directory.
 */
async function moveDirectory(source: string, destination: string) {
  // recursively copy the directory
  await fs.mkdir(destination, { recursive: true });
  const files = await fs.readdir(source);
  for (const file of files) {
    const current = path.join(source, file);
    const dest = path.join(destination, file);
    const stat = await fs.lstat(current);
    if (stat.isDirectory()) {
      fs.mkdir(dest, { recursive: true });
      await moveDirectory(current, dest);
    } else {
      await fs.copyFile(current, dest);
    }
  }
}
/**
 * Deletes a directory and all of its contents.
 * @param directory The directory to delete.
 */
async function deleteDirectory(directory: string) {
  const files = await fs.readdir(directory);
  for (const file of files) {
    const current = path.join(directory, file);
    const stat = await fs.lstat(current);
    if (stat.isDirectory()) {
      await deleteDirectory(current);
    } else {
      await fs.unlink(current);
    }
  }
  await fs.rmdir(directory);
}
/**
 * Gets the asset URL for a tool.
 * - If the tool has a godot asset page, it will get the asset from the page.
 * - If the tool has a git asset, it will get the asset from the latest release.
 * @param tool The tool to get the asset URL for.
 */
async function getAssetURL(tool: DatabaseTool) {
  if (tool.type === 'asset' && tool.options?.git?.owner && tool.options?.git?.repo) {
    const owner = tool.options?.git?.owner;
    const repo = tool.options?.git?.repo;
    if (!owner || !repo) {
      console.log(error('No owner or repository provided for the git asset'));
      process.exit(1);
    }
    const api = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const response = await fetch(api);
    if (response.ok) {
      const json = (await response.json()) as { assets: { name: string; browser_download_url: string }[] };
      return json.assets.find(asset => asset.name === tool.options?.git?.asset)?.browser_download_url ?? '';
    }
  } else if (tool.type === 'asset' && tool.options?.asset?.page) {
    const assetPage = tool.options?.asset?.page;
    if (!assetPage) {
      console.log(error('No asset page was provided for the tool'));
      process.exit(1);
    }
    const page = await fetch(tool.options.asset.page);
    if (page.ok) {
      const text = await page.text();
      return (text.match(/href="([^"]+\.zip)"/) ?? [])?.[1];
    }
  }
  return '';
}
/**
 * Downloads an asset from the asset library.
 * @param tool The tool information.
 */
async function downloadAsset(url: string, tool: DatabaseTool) {
  if (!url?.startsWith('http')) {
    console.log(error('Invalid URL provided for the asset'));
    process.exit(1);
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(error('Failed to download the asset zip file'));
      process.exit(1);
    }
    const buffer = await response.arrayBuffer();
    const zipFileName = `${tool.id}.tmp.zip`;
    const tmpFolderName = `${tool.id}.tmp`;

    await fs.writeFile(zipFileName, Buffer.from(buffer));
    return [zipFileName, tmpFolderName];
  } catch {
    return [];
  }
}
/**
 * Unzips an asset into the project.
 * @param zipFileName The name of the zip file.
 * @param tmpFolderName The name of the temporary folder.
 * @param godotProjectRoot The root of the Godot project.
 */
async function unzipAsset(zipFileName: string, tmpFolderName: string, godotProjectRoot: string) {
  await fs.mkdir(tmpFolderName, { recursive: true });
  await fs.mkdir('addons', { recursive: true });

  yauzl.open(zipFileName, { lazyEntries: true }, (err, zipfile) => {
    if (err) throw err;
    zipfile.readEntry();
    zipfile.on('entry', async entry => {
      if (entry.fileName.endsWith('/')) {
        // Make the directory
        zipfile.readEntry();
        const dir = path.join(tmpFolderName, entry.fileName);
        await fs.mkdir(dir, { recursive: true });
      } else {
        // Make the file
        zipfile.openReadStream(entry, async (err, readStream) => {
          if (err) throw err;
          readStream.on('end', () => zipfile.readEntry());
          await fs.mkdir(path.join(tmpFolderName, path.dirname(entry.fileName)), { recursive: true });
          const file = createWriteStream(path.join(tmpFolderName, entry.fileName));
          file.once('finish', () => file.close());
          readStream.pipe(file);
        });
      }
    });
    zipfile.on('end', async () => {
      fs.rm(zipFileName);
      const directories = await getDirectories('**/addons', path.join(godotProjectRoot, tmpFolderName));
      // move the directories to the addons folder
      for (const dir of directories) {
        await moveDirectory(dir, path.join(godotProjectRoot, 'addons'));
      }
      // copy the files in the root of the tmp folder to the root of the project
      const files = await fs.readdir(tmpFolderName);
      for (const file of files) {
        const stat = await fs.stat(path.join(tmpFolderName, file));
        if (stat.isDirectory()) continue;
        const current = path.join(tmpFolderName, file);
        const dest = path.join(godotProjectRoot, file);
        await fs.copyFile(current, dest);
      }
      await deleteDirectory(tmpFolderName);
    });
  });
}

/**
 * Adds an asset from Godot's asset library to the project.
 * @param tool The tool to add.
 * @param godotProjectRoot The root of the Godot project.
 */
export async function addStoreAsset(tool: DatabaseTool, godotProjectRoot: string) {
  if (godotProjectRoot.toLocaleLowerCase().endsWith('project.godot')) godotProjectRoot = dirname(godotProjectRoot);
  process.chdir(godotProjectRoot);
  const downloadURL = await getAssetURL(tool);
  const [zipFileName, tmpFolderName] = await downloadAsset(downloadURL, tool);
  await unzipAsset(zipFileName, tmpFolderName, godotProjectRoot);
}
/**
 * Adds an asset from a github repository to the project.
 * @param tool The tool to add.
 * @param godotProjectRoot The root of the Godot project.
 */
export async function addGitAsset(tool: DatabaseTool, godotProjectRoot: string) {
  if (godotProjectRoot.toLocaleLowerCase().endsWith('project.godot')) godotProjectRoot = dirname(godotProjectRoot);
  process.chdir(godotProjectRoot);
  const downloadURL = await getAssetURL(tool);
  const [zipFileName, tmpFolderName] = await downloadAsset(downloadURL ?? '', tool);
  await unzipAsset(zipFileName, tmpFolderName, godotProjectRoot);
}
