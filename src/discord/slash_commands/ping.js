import {
 SlashCommandBuilder, MessageFlags, EmbedBuilder, AttachmentBuilder  
	} from 'discord.js';

export const data = new SlashCommandBuilder()
		.setName('ping')
		.setDescription('responds with pong!')
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId, user } = event;
	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('ping')
		.setDescription("pong")

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};