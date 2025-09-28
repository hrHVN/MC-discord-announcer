import {
	AttachmentBuilder, SlashCommandBuilder, EmbedBuilder 
} from 'discord.js';
import path from 'node:path';

export const data = new SlashCommandBuilder()
		.setName('help')
		.setDescription('Display bot commands')
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();
	
	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle("What can this bot do?")
		.addFields({ name: '**/help**', value: 'Displays this message' });

		if (event.memberPermissions?.has('Administrator')) {
			embed.addFields(
				{ name: '**/init**', value: 'Use this command to configure the bot integration with your discord' },	
				{ name: '**/setup**', value: 'Use this command to update the server configuration' },
				{ name: '**/disable**', value: 'Use this command to disable the server. This is usefull if the server is down for maintenace.' },
				{ name: '**/enable**', value: "Use this command to reenable the server. This put's the server back in the query Loop"},
				{ name: '**/ping**', value: 'play ping pong with the bot' }
			)
		}

		embed.addFields(
			{ name: '**/online**', value: 'Displays this message' },
			)

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};