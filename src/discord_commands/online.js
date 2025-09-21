import { SlashCommandBuilder } from 'discord.js';
import { onlinePlayers } from '../mcQuery/mc_q_fn.js';

export const data = new SlashCommandBuilder()
		.setName('online')
		.setDescription('Who is online')
		.setNSFW(false);

export async function execute(interaction) {
		let response = onlinePlayers.length < 1
			? "Currently **no one** is online.." 
			: `these players are online \r${onlinePlayers.map(p => "**"+p+"**\r")}`;

		await interaction.reply(response);
	}