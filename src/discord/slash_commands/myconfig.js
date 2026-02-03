import {
	SlashCommandBuilder, MessageFlags, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, AttachmentBuilder 
} from 'discord.js';
import GuildManager from '../../db/managers/GuildManager.js';
const guildManager = GuildManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('myconfig')
		.setDescription(`See all the current settings!`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId } = event;

	const guildDto = await guildManager.getGuildById(guildId);
	
	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Guild Config');
	
	if (guildDto){
		embed.addFields(
				{ name: "ID", value: `${guildDto.getGuildId()}` },
				{ name: "Disabled?", value: `${guildDto.getDisabled()}` },
				{ name: "Server Name", value: `${guildDto.getGuildName()}` },
				{ name: "Mincraft IP", value: `${guildDto.getServerIp()}` },
				{ name: "Query Port", value: `${guildDto.getQueryPort()}` },				
				{ name: "WebHook", value: `${guildDto.getWatcherHook()}` },
				{ name: "AdminHook", value: `${guildDto.getAdminHook()}` },
				{ name: "RCON Port", value: `${guildDto.getRconPort()}` },
				{ name: "RCON Password", value: `${guildDto.getRconPwd()}` },
				{ name: "Avatar's", value: `
Login: **${guildDto.getMojavatar().login.pose}**/ ${guildDto.getMojavatar().login.crop} 
Logout: **${guildDto.getMojavatar().logout.pose}**/ ${guildDto.getMojavatar().logout.crop}
			`}
			)
		}
		else {
			embed.setDescription('You need to run the \`/init\` command to initialize your server.');
		}
	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};