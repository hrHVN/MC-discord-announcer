import websocketEvents from "./WebsocketEvents.js";

import {playerOnline, playerOffline } from '../player_activity_reporter.js';
import { AdminWebhook } from "../../discord/webhook.js";

import GuildManager from '../../db/managers/GuildManager.js';
import GuildMembersManager from '../../db/managers/GuildMembersManager.js';
import GuildMemberDao from '../../db/dao/GuildMemberDao.js';

const guildMembersManager = GuildMembersManager.getInstance();
const guildManager = GuildManager.getInstance();


export default async function handleMessages(guildId, method, data) {
	let guildDao = (await guildManager.getGuildById(guildId))[0];

	switch (method) {
		case "minecraft:notification/players/joined":
			data.params.forEach(player => {
				playerIsOnline(guildId, player)
			});
			break;
		case 'minecraft:notification/players/left':
			data.params.forEach(player => {
				playerIsOffline(guildId, player)
			});
			break;

		case "minecraft:notification/server/started":
			console.log("Server Started");
			await AdminWebhook(guildDao.getAdminHook(), "Server started!")
			break;
		case "minecraft:notification/server/stopping":
			console.log("Server stopped");
			await AdminWebhook(guildDao.getAdminHook(), "Server stopping!")
			break;
		/*
		case "minecraft:notification/server/saved":
			console.log("Server saving");
			AdminWebhook(guildDao.getAdminHook(), "Server saving!")
			break;
		case "minecraft:notification/server/saving":
			console.log("Server saved");
			AdminWebhook(guildDao.getAdminHook(), "Server saved!")
			break;
		*/
		default:
			/*
				Default to Event Emitter, have slash commands wait for events
			*/
			/*if(data.result && data.result.players && !data.method) {
				data.result.players.forEach(player => {
				playerIsOnline(guildId, player)
				});
			}*/
			console.log("websocketEvents.emit -> ", `${guildId}:${data.id}`, data);

			websocketEvents.emit(`${guildId}:${data.id}`, data);
	}
}

async function playerIsOnline(guildId, json) {
	let userName = json.name;
	let guildDao = await guildManager.getGuildById(guildId);
	let memberDao = await guildMembersManager.getMemeberByName(guildId, userName);

	if (!memberDao || !memberDao.length) {
		memberDao = new GuildMemberDao({
			guild_id: guildId,
			user_name: userName,
			last_seen: new Date().toISOString(),
		});
	}
	
	memberDao.setOnline(true);

	playerOnline(
		guildDao.getWatcherHook(),
		guildDao.getMojavatar(),
		userName);

	guildMembersManager.save(memberDao);

}

async function playerIsOffline(guildId, json) {
	let userName = json.name;
	let guildDao = await guildManager.getGuildById(guildId);
	let memberDao = await guildMembersManager.getMemeberByName(guildId, userName);

	if (!memberDao || !memberDao.length) {
		memberDao = new GuildMemberDao({
			guild_id: guildId,
			user_name: userName,
			last_seen: new Date().toISOString()
		});
	}

	memberDao.setOnline(false);

	playerOffline(
		guildDao.getWatcherHook(),
		guildDao.getMojavatar(),
		userName);

	guildMembersManager.save(memberDao);

}