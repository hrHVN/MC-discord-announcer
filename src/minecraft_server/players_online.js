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

		guildManager.save(guildDao)
		console.log("---DEBUG--- filter_players_online: ", player_);
		for (let memberDao of guildMembers){
			let online = memberDao.getOnline(),
				userName = memberDao.getUserName(),
				index = player_.indexOf(userName);

			if (!online && player_.includes(userName)) {
				memberDao.setOnline(1);
				memberDao.setLastSeen(null);
				player_.splice(index, 1);
				playerOnline(
					guildDao.getWatcherHook(),
					guildDao.getMojavatar(),
					userName);
				guildMembersManager.save(memberDao);
			} 
			else if (online && !player_.includes(userName)){
				memberDao.setOnline(0);
				memberDao.setLastSeen(null);
				playerOffline(
					guildDao.getWatcherHook(),
					guildDao.getMojavatar(), 
					userName);
				guildMembersManager.save(memberDao);
			}
			else if(player_.includes(userName)) {
				// player is still online, remove from the list
				player_.splice(index, 1);
			}
			//console.log("---DEBUG--- filter_players_online( forLoop ): ", userName);
		}

		if (player_.length < 1) return;
		console.log("---DEBUG--- filter_players_online( newPlayer ): ", player_);
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