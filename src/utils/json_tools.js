import { readFile, writeFile } from 'node:fs/promises';


export async function loadJson(filePath) {
  try {
    const text = await readFile(filePath, 'utf8');
    return text ? JSON.parse(text) : [];
    
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function writeJson(filePath, content) {
  const jsonString = JSON.stringify(content, null, 2);

  await writeFile(filePath, jsonString, 'utf8');
}

export async function addEntry(filePath, newItem) {
  const data = await loadJson(filePath);   

  data.push(newItem);

  await writeJson(filePath, data);
}

export async function removeGuild(filePath, uuid) {
  const data = await loadJson(filePath); 
  
  let index = data.findIndex(d => d.guild_id === uuid);

  data.splice(index, 1);     
  
  await writeJson(filePath, data);
}