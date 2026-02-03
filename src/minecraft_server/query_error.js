import { WatcherWebhook } from '../discord/webhook.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import onlinePlayers from '../minecraft_server/OnlinePlayers.js';

const workingdir = join(fileURLToPath(import.meta.url), '../../');

function avoid_false_posetive(tsA, tsB) {
  // Guard against invalid dates
  if (!tsA || !tsB) {
    return false;
  }

  // Convert whatever we got into millisecond numbers
  const t1 = new Date(tsA).getTime();
  const t2 = new Date(tsB).getTime();

  const diffMs = Math.abs(t1 - t2);
  return diffMs > 9_900;
}

export default async function query_error(error, server) {
	console.log("-- DEBUG -- query_error", error);
	return;

	/*
	const { disabled, admin_hook, watcher_hook, falsePosetive, server_name,
		disabled_reset_timer, server_ip, server_suspension_multiplier
		} = server;


	const now = Date.now()
	const not_false = avoid_false_posetive(now, falsePosetive);

	if (!not_false) {
		// Thumbnail
		const file = new AttachmentBuilder(`${workingdir}/Hive_ng_Fun-bee.png`);
		// Message
		const embed = new EmbedBuilder()
			.setColor("Red")
			.setTitle(`Query Error! ${server_name ? server_name : server_ip}`)
			.setThumbnail(`attachment://Hive_ng_Fun-bee.png`)
			.setDescription(`I could'nt connect to the server with the current settings. 
				Are you shure that **[ip:port]** configuration is correct?`
				)
			.addFields(
				{ name: `**disabled**:`, value: `This server has been suspended for _**${ disabled_reset_timer ? server_suspension_multiplier + ' hour' : '60 seconds' }**_ from my querying!` },
				{ name: 'reEnable with', value: '\`/setup query_port:<port_number>\`' },
				)
			.setTimestamp();
		
		// Start timeout
		server.disabled = true;
		server.disabled_timer = now;

		// increment the timeout multiplier
		if (disabled_reset_timer) {
			server.server_suspension_multiplier++;
			
			onlinePlayers.updateServer(server.guild_id,{ 
				server_suspension_multiplier: server.server_suspension_multiplier,
				disabled: true,
				disabled_timer: now,
			});
		}

		// Send discord message to the Admin's
		const hook = admin_hook ? admin_hook : watcher_hook;

		await WatcherWebhook(hook, {
			embeds: 	[embed],
			files: 		[file]
		});
	}
	else {
		console.error(`[ERROR] - query_error - possible false posetive in querying ${error}:\n`, error);
		server.falsePosetive = now;
	}
	*/
}