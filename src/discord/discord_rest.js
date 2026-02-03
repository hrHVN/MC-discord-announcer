import { REST, Routes } from 'discord.js';
import path from 'node:path';
import dotenv from 'dotenv';
import commands from './slash_commands/index.js';

dotenv.config();

/*
	Load all the comands
*/
async function load_commands() {
	// commands not yet initialized
	const _commands = [];									

	// filter known commands from the newly imported ones
	for(const [key, value] of Object.entries(commands)) {
		const command = value;

		// Set a new item in the Collection with the key as the command name and 
		// the value as the exported module
		if ('data' in command && 'execute' in command) {
			_commands.push(command.data.toJSON());
		} 
		else {
			console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	return _commands;
}

/*
	ON guild registration, send comands to the server
*/
export default async function Guild_Update_Commands() {
	try {
		const discord_restapi = new REST().setToken(process.env.DISCORD_TOKEN);
		const _commands = await load_commands();
		console.info(`[INFO] Discord_Update_Commands - Started refreshing ${_commands.length} application (/) commands`);
		
		discord_restapi.put(
			Routes.applicationCommands(process.env.DISCORD_ID),
			{ body: _commands }
		).then(response => {

			console.info(`[INFO] Discord_Update_Commands - Successfully reloaded ${response.length} application (/) commands.`);
		})
		.catch((e) => console.log("[ERROR] Guild_Update_Commands - ", e));

	}
	catch (error) {
		console.error("[INFO] Discord_Update_Commands - ", error);
	}
};