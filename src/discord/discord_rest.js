import { REST, Routes } from 'discord.js';
import path from 'node:path';
import dotenv from 'dotenv';
import commands from './slash_commands/index.js';
import { loadJson, addEntry } from '../utils/json_tools.js';
import onlinePlayers from '../minecraft_server/OnlinePlayers.js';

dotenv.config();

const jsonFilePath = path.join(path.resolve('json'),'registered_commands.json');
const discord_restapi = new REST().setToken(process.env.DISCORD_TOKEN);

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
	Loop over the comands available to the bot, and compare them to the "known" commands. 
	If it finds a new command, it will add it to the returned list
*/
async function filter_new_Commands() {
	// commands not yet initialized
	const newCommands = [];									
	const knownComands = await loadJson(jsonFilePath);

	// filter known commands from the newly imported ones
	for(const [key, value] of Object.entries(commands)) {
		

		if (knownComands.includes(key)) continue;
		const command = value;

		// Set a new item in the Collection with the key as the command name and 
		// the value as the exported module
		if ('data' in command && 'execute' in command) {
			newCommands.push(command.data.toJSON());
		} 
		else {
			console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	return newCommands;
}


/*
	If there is new comands it will send a request to the discord servers to update the 
	possible comands for this bot.
*/
export async function Discord_Update_Commands() {
	const exisitng = await filter_new_Commands();

	if (exisitng.length < 1){
		console.info("No new comands to send to API! Canceling API request.");
		return;
	}
	else if(process.env.NODE_ENV !== "production") {
		console.info("\rCanceling API call in testing !! \r");
		for (const [key, value] of Object.entries(exisitng)) {
			console.info("[INFO] Discord_Update_Commands - ", value.name)
		}
		return;
	} 

	try {
		console.info(`[INFO] Discord_Update_Commands - Started refreshing ${exisitng.length} application (/) commands`);
		const guilds = onlinePlayers.data.map(g => g.guild_id);

		for (const guild of guilds){
			await discord_restapi.put(
				Routes.applicationCommands(process.env.DISCORD_ID),
				{ body: exisitng }
			);
		}

		for (const [key, value] of Object.entries(exisitng)) await addEntry(jsonFilePath, value.name);
		console.info(`[INFO] Discord_Update_Commands - Successfully reloaded ${exisitng.length} application (/) commands.`);
	}
	catch (error) {
		console.error("[ERROR] Discord_Update_Commands -",error);
	}
};

/*
	ON guild registration, send comands to the server
*/
export async function Guild_Update_Commands() {
	try {
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