import { error } from 'console';
import { createWriteStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { dirname } from 'path';
import * as yauzl from 'yauzl';
import { DatabaseTool } from '../types.js';
import { getDirectories } from './exists.js';

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
 * Downloads an asset from the asset library.
 * @param tool The tool information.
 */
async function downloadAsset(tool: DatabaseTool) {
  try {
    let url = tool.options?.asset?.page ?? '';
    const page = await fetch(url);
    if (page.ok) {
      const text = await page.text();
      const url = (text.match(/href="([^"]+\.zip)"/) ?? [])?.[1];

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
    }
  } catch {
    return [];
  }
  return [];
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
          const file = createWriteStream(path.join(tmpFolderName, entry.fileName));
          file.once('finish', () => file.close());
          readStream.pipe(file);
        });
      }
    });
    zipfile.on('end', async () => {
      fs.rm(zipFileName);
      const directories = await getDirectories('**/addons', path.join(godotProjectRoot, tmpFolderName));
      for (const dir of directories) {
        await moveDirectory(dir, path.join(godotProjectRoot, 'addons'));
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
export async function addAsset(tool: DatabaseTool, godotProjectRoot: string) {
  if (godotProjectRoot.toLocaleLowerCase().endsWith('project.godot')) godotProjectRoot = dirname(godotProjectRoot);

  const assetPage = tool.options?.asset?.page;
  if (!assetPage) {
    console.log(error('No asset page was provided for the tool'));
    process.exit(1);
  }
  process.chdir(godotProjectRoot);

  const [zipFileName, tmpFolderName] = await downloadAsset(tool);
  if (zipFileName && tmpFolderName) {
    await unzipAsset(zipFileName, tmpFolderName, godotProjectRoot);
  } else {
    console.log(error('Could not fetch asset information from the asset library'));
    process.exit(1);
  }
}
