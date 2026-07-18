import dotenv from 'dotenv';
import path from 'node:path';
import { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Sleep from './utils/Sleep.js'
// Databse
import InitialiseDatabase from './db/InitialiseDatabase.js';
import DatabaseManager from './db/managers/DatabaseManager.js';
import GuildManager from './db/managers/GuildManager.js';
import GuildMembersManager from './db/managers/GuildMembersManager.js';
// Mojang
import { lunareclipse } from './utils/mojang_api.js';
import {MinecraftSocketeer, servers} from "./minecraft_server/management_server/ManagementServer.js";
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
await databaseManager.InitialiseSQLite();

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
//const servers = {};
let gint = 1;

process.on('SIGTERM', async () => {
  console.info('[worker] SIGTERM received – shutting down gracefully...');
  servers.forEach(conn => conn.close());
  shuttingDown = true;
  process.exit(0);
});

process.on('uncaughtException', err => {
  console.error('[fatal] uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[fatal] unhandledRejection:', reason);
  process.exit(1);
});

function Wait(ms, cb) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (cb) cb();
      resolve();
    }, ms);
  });
}

const keepaliveTimer = setInterval(async () => {
	try {
		let activeServers = Object.values(servers).map(con => con.getId());
		let guilds = (await guildManager.getAllGuilds())
			.filter(guild => !activeServers.includes(guild.getGuildId()))
			.forEach(guild => {
				const manager = {
					ip: guild.getServerIp(),
					port: guild.getManagerPort(),
					password: guild.getManagerPwd(),
				}
			
				if (!manager.ip || !manager.port || !manager.password) {
					console.log("This Guild is not configured", guild.getGuildId());
					return;
				}
			
				servers[`s${gint}`] = new MinecraftSocketeer(
					guild.getServerIp(),
					guild.getManagerPort(),
					guild.getManagerPwd(),
					`${guild.getGuildId()}`
					);	
			});
		}
	catch(e) {
		console.log("keepaliveTimer failed -> ", e)
	}
}, 60000);

(await guildManager.getAllGuilds()).forEach(guild => {
	const manager = {
		ip: guild.getServerIp(),
		port: guild.getManagerPort(),
		password: guild.getManagerPwd(),
	}
	let id = guild.getGuildId();

	if (!manager.ip || !manager.port || !manager.password || guild.getDisabled()) {
		console.log("This Guild is not configured", guild.getGuildId());
		return;
	}

	servers[`${id}`] = new MinecraftSocketeer(
		guild.getServerIp(),
		guild.getManagerPort(),
		guild.getManagerPwd(),
		`${guild.getGuildId()}`
		);	
});

keepaliveTimer.unref(); 
