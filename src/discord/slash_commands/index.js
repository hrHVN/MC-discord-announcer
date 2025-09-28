import { readdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = join(__filename, '..');


async function loadCommands() {
  const files = await readdir(__dirname);
  const commands = {};

  for (const file of files) {
    // Only process .js files and ignore this index file
    if (extname(file) !== '.js' || file === basename(__filename)) continue;


    const modulePath = pathToFileURL(join(__dirname, file)).href;
    const mod = await import(modulePath);   // dynamic import

    // Guard against missing exports – you can adjust the check to suit you
    if (!mod.data || typeof mod.execute !== 'function') {
      console.warn(`${file} does not export both “data” and “execute”. Skipping.`);
      continue;
    }

    // Use the command name defined in the SlashCommandBuilder (or fallback to filename)
    const name = mod.data.name ?? basename(file, '.js');
    commands[name] = mod; //.set(name, { data: mod.data, execute: mod.execute });
  }

  return commands;                          // Map<string, {data,execute}>
}

const commandsPromise = await loadCommands();
export default commandsPromise;