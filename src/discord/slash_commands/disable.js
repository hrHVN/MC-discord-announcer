import {
	AttachmentBuilder, SlashCommandBuilder, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType 
} from 'discord.js';
import GuildManager from '../../db/managers/GuildManager.js';
import GuildMembersManager from '../../db/managers/GuildMembersManager.js';
const guildManager = GuildManager.getInstance();
const guildMembersManager = GuildMembersManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('disable')
		.setDescription(`Disengage the MC Announcer.`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId } = event;
	const guildDto = await guildManager.getGuildById(guildId);

	guildDto.setDisabled(true);
	guildDto.setDisabledTimer(null);
	guildDto.setDisabledResetTimer(null);
	guildDto.setFalsePosetive(false);

	await guildManager.save(guildDto);

	const guildMemberDto = (await guildMembersManager.getAllGuildMembers(guildId))
			.forEach(member => {
				member.setOnline(0);
				guildMembersManager.save(member);
			});

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Red")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Manually disabled the Guild')
		.setDescription(`The ${ guildDto.getGuildName() ? guildDto.getGuildName() : guildDto.getServerIp() } has been removed from the Query Loop!`);

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};