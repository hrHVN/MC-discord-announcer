import {
	SlashCommandBuilder, MessageFlags, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, AttachmentBuilder 
} from 'discord.js';
import onlinePlayers from '../../minecraft_server/OnlinePlayers.js'

export const data = new SlashCommandBuilder()
		.setName('myconfig')
		.setDescription(`See all the current settings!`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId } = event;

	const server = onlinePlayers.data.find(d => {
		if(d.guild_id == guildId) return d;
	});

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Guild Config');

		if (server){
			embed.addFields(
				{ name: "ID", value: `${server.guild_id}` },
				{ name: "Disabled?", value: `${server.disabled}` },
				{ name: "Server Name", value: `${server.server_name}` },
				{ name: "Mincraft IP", value: `${server.server_ip}` },
				{ name: "Query Port", value: `${server.query_port}` },
				{ name: "WebHook", value: `${server.watcher_hook}` },
				{ name: "AdminHook", value: `${server.admin_hook}` },
				{ name: "RCON Port", value: `${server.rcon_port}` },
				{ name: "RCON Password", value: `${server.rcon_pwd}` },
				{ name: "Avatar's", value: `
Login: **${server.mojavatar.login.pose}**/ ${server.mojavatar.login.crop} 
Logout: **${server.mojavatar.logout.pose}**/ ${server.mojavatar.logout.crop}
			`}
			)
		}
		else embed.setDescription('You need to run the \`/init\` command to initialize your server.')

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};