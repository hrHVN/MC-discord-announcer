import dotenv from 'dotenv';
import path from 'node:path';

// Mojang
import { lunareclipse } from './utils/mojang_api.js';
import onlinePlayers from './minecraft_server/OnlinePlayers.js';
import { MinecraftQuery } from './minecraft_server/MinecraftQuery.js';
import filter_players_online from './minecraft_server/players_online.js'

// Discord
import { Discord_Update_Commands, Guild_Update_Commands } from './discord/discord_rest.js';
import discordClient from './discord/DiscordClient.js';
import "./discord/client_listeners.js";

dotenv.config();

/*
	DISCORD
*/
await Guild_Update_Commands();									// Try updating the available comands.

discordClient.login(process.env.DISCORD_TOKEN);		// Login the BOT
/*
	Default Avatar
*/
let once = false;
if(!once) {
	await lunareclipse("Notch", "default")
}

/*
	Main Loop
*/
async function loop(){
	for(const server of onlinePlayers.data) {
		
		await MinecraftQuery(
			server.server_ip,
			server.query_port,
			async (response) => filter_players_online(response, server)
		);
	}
}

setInterval(async () => await loop(), 10000);
