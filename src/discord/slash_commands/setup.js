import {
	SlashCommandBuilder, MessageFlags, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, AttachmentBuilder 
} from 'discord.js';
import { mojavatarOptions } from '../../utils/mojang_api.js';
import GuildManager from '../../db/managers/GuildManager.js';
const guildManager = GuildManager.getInstance();

const avatarNames = mojavatarOptions.map(a => {
	return { name: a.pose, value: a.pose };
});

export const data = new SlashCommandBuilder()
		.setName('setup')
		.setDescription(`Need to change the config?`)	
		.addStringOption(option =>
			option
				.setName('webhook')
				.setDescription('the webhook url')
				)
		.addStringOption(option =>
			option
				.setName('adminhook')
				.setDescription('the webhook for admin messages')
				)
		.addStringOption(option =>
			option
				.setName('server_ip')
				.setDescription('Server IP or URL.')
				)
		.addStringOption(option =>
			option
				.setName('query_port')
				.setDescription('Minecraft Query Port. _Remember to enable Query in server.properties_')
				)
		.addStringOption(option =>
			option
				.setName('rcon_port')
				.setDescription('Minecraft rcon Port. _Remember to enable rcon in server.properties_')
				)
		.addStringOption(option =>
			option
				.setName('rcon_password')
				.setDescription('Minecraft rcon Password. _Remember to define the Password in server.properties_')
				)
		.addStringOption(option =>
			option
				.setName('avatar_login')
				.setDescription('Which avatar to use when people join the server?')
				.addChoices(avatarNames)
				)
		.addStringOption(option =>
			option.setName('avatar_login_crop')
				.setDescription('Avatar options')
				.addChoices({ name: "full", value: "full" },
					{ name: "bust", value: "bust" },
					{ name: "face", value: "face" })
				)
		.addStringOption(option =>
			option
				.setName('avatar_logout')
				.setDescription('Which avatar to use when people leave the server?')
				.addChoices(avatarNames)
				)
		.addStringOption(option =>
			option
				.setName('avatar_logout_crop')
				.setDescription('Avatar options')
				.addChoices(
					{ name: "full", value: "full" },
					{ name: "bust", value: "bust" },
					{ name: "face", value: "face" }
					)
				)
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId, user } = event;
	const guildDto = await guildManager.getGuildById(guildId);

	[
		'adminhook','webhook','server_ip','query_port','rcon_port','rcon_password',
		'avatar_login','avatar_login_crop','avatar_logout','avatar_logout_crop'
	].forEach(option => {		
		const response = event.options.getString(option);
		let mojavatar;

		if (response) {
			switch(option)
			{
				case 'server_ip': 		guildDto.setServerIp(response);		break;
				case 'query_port': 		guildDto.setQueryPort(parseInt(response));	break;
				case 'rcon_port': 		guildDto.setRconPort(parseInt(response));	break;
				case 'rcon_password': 	guildDto.setRconPwd(response);		break;
				case 'webhook': 		guildDto.setWatcherHook(response);	break;
				case 'adminhook': 		guildDto.setAdminHook(response);	break;
				case 'avatar_login': 
					mojavatar = guildDto.getMojavatar();	
					mojavatar.login.pose = response;
					guildDto.setMojavatar(mojavatar);	
					break;
				case 'avatar_login_crop':
					mojavatar = guildDto.getMojavatar(); 	
					mojavatar.login.crop = response; 
					guildDto.setMojavatar(mojavatar);		
					break;
				case 'avatar_logout':
					mojavatar = guildDto.getMojavatar(); 		
					mojavatar.logout.pose = response; 	
					guildDto.setMojavatar(mojavatar);	
					break;
				case 'avatar_logout_crop': 	
					mojavatar = guildDto.getMojavatar();
					mojavatar.logout.crop = response;	
					guildDto.setMojavatar(mojavatar);	
					break;

				default: break;
			}
		}
	});

	await guildManager.save(guildDto);

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Guild Config')
		.addFields(
			{ name: "ID", value: `${guildDto.getGuildId()}` },
			{ name: "AdminHook", value: `${guildDto.getAdminHook()}` },
			{ name: "WebHook", value: `${guildDto.getWatcherHook()}` },
			{ name: "Mincraft IP", value: `${guildDto.getServerIp()}` },
			{ name: "Query Port", value: `${guildDto.getQueryPort()}` },
			{ name: "RCON Port", value: `${guildDto.getRconPort()}` },
			{ name: "RCON Password", value: `${guildDto.getRconPwd()}` },
			{ name: "Avatar's", value: `Login: **${guildDto.getMojavatar().login.pose}** \nLogout: **${guildDto.getMojavatar().logout.pose}**`}
		);

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};