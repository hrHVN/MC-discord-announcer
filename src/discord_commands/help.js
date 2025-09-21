import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
		.setName('help')
		.setDescription('Displays bot commands')
		.setNSFW(false);

export async function execute(interaction) {
		await interaction.reply(`This bot supports these commands:
	**/help** -> Displays this message 
	**/online** -> Se who is on the Minecraft server 
	`);
};