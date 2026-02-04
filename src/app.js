import dotenv from 'dotenv';
import path from 'node:path';
import { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Databse
import DatabaseManager from './db/managers/DatabaseManager.js';
import GuildManager from './db/managers/GuildManager.js';
import GuildMembersManager from './db/managers/GuildMembersManager.js';

// Mojang
import { lunareclipse } from './utils/mojang_api.js';
import { MinecraftQuery } from './minecraft_server/MinecraftQuery.js';
import filter_players_online from './minecraft_server/players_online.js'
import query_error from './minecraft_server/query_error.js'

// Discord
import Guild_Update_Commands from './discord/discord_rest.js';
import DiscordClient from './discord/DiscordClient.js';
import "./discord/client_listeners.js";

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
/*
		Initializations
*/
const databaseManager = DatabaseManager.getInstance();
await databaseManager.initialiseDatabase();

const guildManager = GuildManager.getInstance();
const guildMembersManager = GuildMembersManager.getInstance();

/*
	DISCORD
*/
const discordClient = DiscordClient.getInstance();
discordClient.getClient().login(process.env.DISCORD_TOKEN);

/*
	Default Avatar
*/
let notchPng = path.resolve('Notch.png');
if (fs.existsSync(notchPng)) await lunareclipse("Notch", "default");

const discordRestUpdate = process.env.DISCORD_UPDATE == "true" 
	? true : false;
if(discordRestUpdate) {
	// Try updating the available comands.
	await Guild_Update_Commands();										
}

/*
	Main Loop
*/
let shuttingDown = false;

process.on('SIGTERM', async () => {
  console.info('[worker] SIGTERM received – shutting down gracefully...');
  shuttingDown = true;
});

process.on('uncaughtException', err => {
  console.error('[fatal] uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[fatal] unhandledRejection:', reason);
  process.exit(1);
});

(async () => {
	console.info("[INFO] - Starting loop ..");
	try {
		while(!shuttingDown){
			const guilds = (await guildManager.getAllGuilds())
				.filter(g => !g.getDisabled());
			const serverQuerys = [];
			for (let guildDao of guilds) {
				// Validate server quarantine
				if (false) {
					guildDao.disabled
					guildDao.falsePosetive
					guildDao.disabledTimer
					guildDao.disabledResetTimer
				}
				serverQuerys.push(
					MinecraftQuery(
						guildDao.getServerIp(),
						guildDao.getQueryPort(),
						async (response) => await filter_players_online(response, guildDao),
						async (error) => await query_error(error, guildDao)
					)
				);
			}

			await Promise.all(serverQuerys);
			await new Promise(resolve => setTimeout(resolve, 8_000));
		}		
	}
	catch (error) {
		console.error("ERROR --- Unhinged Error --- \n", error);
	} 
	finally {
    try {
      await databaseManager.close();
      console.info('[worker] database closed');
    } catch (closeErr) {
      console.error('[worker] error while closing DB:', closeErr);
    }

    console.info('[worker] stopped.');
    process.exit(0);
  }
})();


