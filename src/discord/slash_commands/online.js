import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from 'discord.js';
import onlinePlayers from '../../minecraft_server/OnlinePlayers.js';
import { mojang_get_uuid, get_avatar_head } from '../../utils/mojang_api.js';

export const data = new SlashCommandBuilder()
		.setName('online')
		.setDescription('Who is online')
		.setNSFW(false);

export async function execute(event) {
		await event.deferReply();			// Send a "wait" message to Discord api
		const { guildId, user } = event;
		
		const online = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle("These players are online");

		const server = onlinePlayers.data.find(s => s.guild_id === guildId);
			

		for (const player of server.online_players) {
			online.addFields({ name: player })
		}

		if (server.online_players.length < 1) online.setDescription("Currently **no one** is online..");
		else online.setTitle("These players are online");
			
		await event.followUp({
			ephemeral: true,
			embeds: [online]
		});
	}


