import {
	AttachmentBuilder, SlashCommandBuilder, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, MessageFlags
} from 'discord.js';
import GuildManager from '../../db/managers/GuildManager.js';
import GuildMembersManager from '../../db/managers/GuildMembersManager.js';
import websocketEvents from "../../minecraft_server/management_server/WebsocketEvents.js";
import { servers } from "../../minecraft_server/management_server/ManagementServer.js";

const guildManager = GuildManager.getInstance();
const guildMembersManager = GuildMembersManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('disable')
		.setDescription(`Disengage the MC Announcer.`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply({ flags: MessageFlags.Ephemeral });

	const { guildId } = event;
	const guildDto = await guildManager.getGuildById(guildId);

	if (Object.keys(servers).includes(guildId)) {
		servers[guildId].close();
		delete servers[guildId];
	}

	guildDto.setDisabled(true);
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
			embeds: [embed],
			files: [file]
		});
};