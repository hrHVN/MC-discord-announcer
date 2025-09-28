import {
	SlashCommandBuilder, MessageFlags, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, AttachmentBuilder
} from 'discord.js';
import onlinePlayers from '../../minecraft_server/OnlinePlayers.js'

export const data = new SlashCommandBuilder()
		.setName('init')
		.setDescription(`The bot needs a few values to work propperly.`)	
		.addStringOption(option =>
			option
				.setName('webhook')
				.setDescription('the webhook url')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('server_ip')
				.setDescription('Server IP or URL.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('query_port')
				.setDescription('Minecraft Query Port. _Remember to enable Query in server.properties_')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('adminhook')
				.setDescription('the webhook used for admin messages'))
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId, user } = event;
	let adminHook = event.options?.getString('adminhook');

	await onlinePlayers.addServer(guildId,
		adminHook || event.options.getString('webhook'),
		event.options.getString('webhook') ,
		event.options.getString('server_ip'),
		event.options.getString('query_port')
		);

	const server = onlinePlayers.data.find(d => d.guild_id == guildId);

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Guild Config')
		.addFields(
			{ name: "ID", value: `${server.guild_id}` },
			{ name: "WebHook", value: `${server.watcher_hook}` },
			{ name: "Mincraft IP", value: `${server.server_ip}` },
			{ name: "Query Port", value: `${server.query_port}` },
			{ name: "RCON Port", value: `${server.rcon_port}` },
			{ name: "RCON Password", value: `${server.rcon_pwd}` },
			{ name: "Avatar's", value: `Login: **${server.mojavatar.login.pose}** \nLogout: **${server.mojavatar.logout.pose}**`}
		);

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};