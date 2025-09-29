import dotenv from 'dotenv';
import path from 'node:path';

// Mojang
import { lunareclipse } from './utils/mojang_api.js';
import onlinePlayers from './minecraft_server/OnlinePlayers.js';
import { MinecraftQuery } from './minecraft_server/MinecraftQuery.js';
import filter_players_online from './minecraft_server/players_online.js'
import query_error from './minecraft_server/query_error.js'

// Discord
import { Discord_Update_Commands, Guild_Update_Commands } from './discord/discord_rest.js';
import discordClient from './discord/DiscordClient.js';
import "./discord/client_listeners.js";

dotenv.config();

/*
	DISCORD
*/

discordClient.login(process.env.DISCORD_TOKEN);		// Login the BOT
let once = false;
if(!once) {
	console.info("[DEBUG] ONCE")

	// Try updating the available comands.
	await Guild_Update_Commands();									

	/*
		Default Avatar
	*/
	await lunareclipse("Notch", "default");

	/*
		Update Server profiles with new settings
	*/
	for(let server of onlinePlayers.data) {
		if (!server?.falsePosetive && server.falsePosetive !== null) {

			await onlinePlayers.updateServer(server.guild_id,{
						disabled 						: "false",
			    	falsePosetive				: "null",
			    	disabled_timer			: "null",
			    	disabled_reset_timer: "null",
			    	server_name 				: "null",
			    	server_suspension_multiplier : 1
							});
		}
	}
}

/*
	Calculate Suspesion timer
*/
function server_overdue(tsA, tsB, diff = 60_000) {
  // Guard against invalid dates
  if (!tsA || !tsB) {
    return false;
  }

  // Convert whatever we got into millisecond numbers
  const t1 = new Date(tsA).getTime();
  const t2 = new Date(tsB).getTime();

  const diffMs = Math.abs(t1 - t2);
  return diffMs > diff;
}
/*
	Main Loop
*/
async function loop(){
	const now = Date.now();

	for(let server of onlinePlayers.data) {

		let over_due = server_overdue(now, server.disabled_timer, 60_000);
		let long_overdue = server_overdue(now, server.disabled_reset_timer, server.server_suspension_multiplier * 3600_000);
		
		//	viss lang vente tid har starta, og den ikkje er utgått
		if (over_due && server.disabled_reset_timer && long_overdue) {
			//console.info("[INFO] 1H Overdue!");
			//server.disabled_reset_timer = null;
			server.falsePosetive = null;
			server.disabled = false;
			over_due = false;
			server.server_suspension_multiplier++;
		}

		// Viss serveren har time_out, og det ikkje har gått 60 sekund sidan sist Query
		// Hopp over
		if ( (server.disabled && !over_due) || (over_due && server.disabled_reset_timer) ) {
			//console.info("[INFO] - %s - temporarily disabled ", server.server_ip, long_overdue);
			continue;
		} 

		// 	Viss det har gått 60 sekund sidan sist Query
		//	sjekk status, og sett lang ventetid.
		if (over_due && !server.disabled_reset_timer) {
			console.info("[INFO] - setting <disabled_reset_timer>");
			server.disabled_reset_timer = now;

			console.info("[INFO] 60s Overdue!");
			server.disabled = false;
			server.falsePosetive = now;
		} 

		// Ellers send Query
		await MinecraftQuery(
			server.server_ip,
			server.query_port,
			async (response) => await filter_players_online(response, server),
			async (error) => await query_error(error, server)
		);
	}
}

setInterval(async () => await loop(), 10000);

