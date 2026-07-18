import {
	AttachmentBuilder, SlashCommandBuilder, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, MessageFlags
} from 'discord.js';
import GuildManager from '../../db/managers/GuildManager.js';
import websocketEvents from "../../minecraft_server/management_server/WebsocketEvents.js";
import { servers, MinecraftSocketeer } from "../../minecraft_server/management_server/ManagementServer.js";

const guildManager = GuildManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('enable')
		.setDescription(`Disengage the MC Announcer.`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply({ flags: MessageFlags.Ephemeral });

	const { guildId } = event;
	const guildDto = await guildManager.getGuildById(guildId);

	if (guildDto.getGuildId() && guildDto.getManagerPort() && guildDto.getManagerPwd()) {
		servers[`${guildId}`] = new MinecraftSocketeer(
			guildDto.getServerIp(),
			guildDto.getManagerPort(),
			guildDto.getManagerPwd(),
			`${guildId}`
			);	
	}


	guildDto.setDisabled(false);
	await guildManager.save(guildDto);

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Reenabled the Guild')
		.setDescription(`The ${ guildDto.getGuildName() ? guildDto.getGuildName() : guildDto.getServerIp() } has been added to the Query Loop again!`);

	await event.followUp({
			embeds: [embed],
			files: [file]
		});
};