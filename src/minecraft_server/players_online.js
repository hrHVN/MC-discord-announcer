import { playerOnline, playerOffline } from './player_activity_reporter.js'
import { AdminWebhook } from '../discord/webhook.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

import GuildManager from '../db/managers/GuildManager.js';
import GuildMembersManager from '../db/managers/GuildMembersManager.js';
import GuildMemberDao from '../db/dao/GuildMemberDao.js';
const guildMembersManager = GuildMembersManager.getInstance();
const guildManager = GuildManager.getInstance();
/*
	Takes the minecraft query result and the guild-server object, to figure out who has come
	online and who has left the server.
*/
export default async function filter_players_online(query, guildDao) {
	try {
		const { player_, hostname } = query;
		const guildMembers = await guildMembersManager.getAllGuildMembers(guildDao.getGuildId());

		// Save the Servers Host name as Server Name
		if (guildDao.getGuildName() == "") {
			guildDao.setGuildName(hostname);
		}
		/*
		// reset Supsension counters
		if (server_suspension_multiplier !== 1 || disabled_reset_timer !== null) {
			await onlinePlayers.updateServer(guild_id,{ 
				disable: "false",
				disabled_reset_timer: "null",
				disabled_timer: "null",
				falsePosetive: "null",
				server_suspension_multiplier: 1,
	 		});

			let hook = admin_hook ? admin_hook : watcher_hook;

			// create message card
			const embed = new EmbedBuilder()
				.setColor("Yellow")
				.setTitle(`Suspension lifted!`)
				.setDescription(`The ${server_name} responded to my Query, so i have lifted the suspension. :slight_smile:`)
				.setTimestamp();

			AdminWebhook(hook, { embeds: [embed] });
		}		
		// Login Players
		player_.map(playerName => {
			if(!online_players.includes(playerName)){
				playerOnline(watcher_hook, online_players, mojavatar, playerName, server_name);
			}
		});	
		// if online_players[x] not in player_ send logout event
		online_players.map(playerName => {
			if(!player_.includes(playerName)){
				playerOffline(watcher_hook, online_players, mojavatar, playerName, server_name);
			}
		});
*/
		guildManager.save(guildDao)

		for (let memberDao of guildMembers){
			let online = memberDao.getOnline(),
				userName = memberDao.getUserName(),
				index = player_.indexOf(userName);

			if (!online && player_.includes(userName)){
				memberDao.setOnline(1);
				memberDao.setLastSeen(null);
				player_.splice(index, 1);
				playerOnline(
					guildDao.getWatcherHook(),
					guildDao.getMojavatar(),
					userName);

			} else if (online && !player_.includes(userName)){
				memberDao.setOnline(0);
				memberDao.setLastSeen(null);
				playerOffline(
					guildDao.getWatcherHook(),
					guildDao.getMojavatar(), 
					userName);

			}
			else {
				// player is still online, remove from the list
				player_.splice(index, 1);
			}
			guildMembersManager.save(memberDao);
		}

		if (player_.length < 1) return;
		for (let newPlayer of player_) {
			guildMembersManager.save(new GuildMemberDao({
				guild_id: guildDao.getGuildId(),
				user_name: newPlayer,
				last_seen: null
			}));
			playerOnline(
					guildDao.getWatcherHook(),
					guildDao.getMojavatar(), 
					newPlayer);
		}

  	}
  	catch (error) {
  		console.error("[ERROR] filter_players_online - ", error);
  		return;
  	}
}