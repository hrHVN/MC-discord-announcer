import {
	AttachmentBuilder, SlashCommandBuilder, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType 
} from 'discord.js';
import GuildManager from '../../db/managers/GuildManager.js';
const guildManager = GuildManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('enable')
		.setDescription(`Disengage the MC Announcer.`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId } = event;
	const guildDto = await guildManager.getGuildById(guildId);

	guildDto.setDisabled(false);
	guildDto.setDisabledTimer(null);
	guildDto.setDisabledResetTimer(null);
	guildDto.setFalsePosetive(false);

	await guildManager.save(guildDto);

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Reenabled the Guild')
		.setDescription(`The ${ guildDto.getGuildName() ? guildDto.getGuildName() : guildDto.getServerIp() } has been added to the Query Loop again!`);

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};