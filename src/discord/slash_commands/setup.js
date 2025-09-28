import {
	SlashCommandBuilder, MessageFlags, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, AttachmentBuilder 
} from 'discord.js';
import onlinePlayers from '../../minecraft_server/OnlinePlayers.js'
import { mojavatarOptions } from '../../utils/mojang_api.js';

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
	const newValues = {};
	const oldServer = onlinePlayers.data.find(d => {
		if(d.guild_id == guildId) return d;
	});

	[
		'adminhook','webhook','server_ip','query_port','rcon_port','rcon_password',
		'avatar_login','avatar_login_crop','avatar_logout','avatar_logout_crop'
	].forEach(option => {
		let name;
		
		const response = event.options.getString(option);
		if (response) {
			switch(option)
			{
				case 'server_ip':
				case 'query_port':
				case 'rcon_port':
					newValues[option] = response;
					break;

				case 'rcon_password':
					newValues['rcon_pwd'] = response;
					break;

				case 'webhook':
					newValues["watcher_hook"] = response;
					break;

				case 'adminhook':
					newValues["admin_hook"] = response;
					break;

				case 'avatar_login':
					if(!newValues?.mojavatar?.login ) { 
						if(!newValues.mojavatar) newValues.mojavatar = {};

						newValues['mojavatar']["login"] = { 
								pose: response, 
								crop: oldServer.mojavatar.login.crop
							}
					}
					else newValues['mojavatar'].login.pose = response;
					break;

				case 'avatar_login_crop':
					if(!newValues?.mojavatar?.login ) { 
						if(!newValues.mojavatar) newValues.mojavatar = {};

						newValues['mojavatar']["login"] = { 
								pose: oldServer.mojavatar.login.pose, 
								crop:response
							}
						}
					else newValues['mojavatar'].login.crop = response;

					break;

				case 'avatar_logout':
					if(!newValues?.mojavatar?.logout ) { 
						if(!newValues.mojavatar) newValues.mojavatar = {};

						newValues['mojavatar']["logout"] = { 
								pose: response, 
								crop: oldServer.mojavatar.logout.crop
							}
						}
					else newValues['mojavatar'].logout.pose = response;
					break;

				case 'avatar_logout_crop':
					if(!newValues?.mojavatar?.logout ) { 
						if(!newValues.mojavatar) newValues.mojavatar = {};

						newValues['mojavatar']["logout"] = { 
								pose: oldServer.mojavatar.logout.pose, 
								crop: response
							}
						}
					else newValues['mojavatar'].logout.crop = response
					break;
			}
		}
	});

	await onlinePlayers.updateServer(guildId, newValues);

	const server = onlinePlayers.data.find(d => {
		if(d.guild_id == guildId) return d;
	});

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Guild Config')
		.addFields(
			{ name: "ID", value: `${server.guild_id}` },
			{ name: "WebHook", value: `${server.watcher_hook}` },
			{ name: "AdminHook", value: `${server.admin_hook}` },
			{ name: "Mincraft IP", value: `${server.server_ip}` },
			{ name: "Query Port", value: `${server.query_port}` },
			{ name: "RCON Port", value: `${server.rcon_port}` },
			{ name: "RCON Password", value: `${server.rcon_pwd}` },
			{ name: "Avatar's", value: `
Login: **${server.mojavatar.login.pose}**/ ${server.mojavatar.login.crop} 
Logout: **${server.mojavatar.logout.pose}**/ ${server.mojavatar.logout.crop}
		`}
		);

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};