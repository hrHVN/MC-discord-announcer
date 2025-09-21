import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
		.setName('ping')
		.setDescription('responds with pong!')
		.setNSFW(false);

export async function execute(interaction) {
		await interaction.reply(`pong`);
};