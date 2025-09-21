import { REST, Routes } from 'discord.js';
import { writeFileSync, readFileSync, renameSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import commands from '../discord_commands/index.js';

dotenv.config();

const jsonFilePath = path.join(path.resolve('discord_restapi'),'registered_commands.json');
const discord_restapi = new REST().setToken(process.env.DISCORD_TOKEN);

async function loadJson() {
	//console.log("\n Loading JSON ... \n");
  try {
    const text = await readFile(jsonFilePath, 'utf8');
    return text ? JSON.parse(text) : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJson(content) {
  const jsonString = JSON.stringify(content, null, 2);
  await writeFile(jsonFilePath, jsonString, 'utf8');
}

export async function addEntry(newItem) {
  const data = await loadJson();   // existing array
  data.push(newItem);              // add the new entry
  await writeJson(data);           // save back
}

async function loadCommands() {
	// commands not yet initialized
	const newCommands = [];									
	const knownComands = await loadJson();

	// filter known commands from the newly imported ones
	for(const [key, value] of Object.entries(commands)) {
		
		console.log("discord_rest.js for-loop: ", key);

		if (knownComands.includes(key)) continue;
		const command = value;

		// Set a new item in the Collection with the key as the command name and 
		// the value as the exported module
		if ('data' in command && 'execute' in command) {
			newCommands.push(command.data.toJSON());
		} 
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	return newCommands;
}

export async function Discord_Update_Commands() {
	const exisitng = await loadCommands();

	if (exisitng.length < 1){
		console.log("No new comands to send to API! Canceling API request.");
		return;
	}
	else if(process.env.NODE_ENV !== "production") {
		console.info("\rCanceling API call in testing !! \r");
		for (const [key, value] of Object.entries(exisitng)) {
			console.log(value.name)
			await addEntry(value.name);
		}
		return;
	}
	try {
		console.log(`Started refreshing ${exisitng.length} application (/) commands`);

		const data = await discord_restapi.put(
			Routes.applicationGuildCommands(process.env.DISCORD_ID, process.env.DISCORD_GUILD_ID),
			{ body: exisitng }
			);
		for (const [key, value] of Object.entries(exisitng)) await addEntry(value.name);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
};