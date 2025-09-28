import { playerOnline, playerOffline } from './player_activity_reporter.js'
import onlinePlayers from './OnlinePlayers.js';
import { WatcherWebhook } from '../discord/webhook.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

/*
	Takes the minecraft query result and the guild-server object, to figure out who has come
	online and who has left the server.
*/
export default function filter_players_online(query, server) {
	try {
		const { player_, hostname } = query;
		const {
			guild_id, online_players, watcher_hook, mojavatar, server_name,
			disabled_reset_timer, server_suspension_multiplier, admin_hook
		} = server;

		// Save the Servers Host name as Server Name
		if (!server_name) onlinePlayers.updateServer(guild_id,{ server_name: hostname });
		
		// reset Supsension counters
		if (server_suspension_multiplier !== 1 || disabled_reset_timer !== null) {
			disabled_reset_timer = null; 
			server_suspension_multiplier = 1;

			// create message card
			const embed = new EmbedBuilder()
				.setColor("Yellow")
				.setTitle(`Suspension lifted!`)
				.setDescription(`The ${server_name} responded to my Query, so i have lifted the suspension. :slight_smile:`)
				.setTimestamp();

			AdminWebhook(admin_hook, { embeds: [embed] });
		}
		
		// Login Palyers
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

  	}
  	catch (error) {
  		console.error("[ERROR] filter_players_online - ", error);
  		return;
  	}
}