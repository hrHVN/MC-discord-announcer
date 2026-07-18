import {
	SlashCommandBuilder, MessageFlags, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType, AttachmentBuilder
} from 'discord.js';
import GuildManager from '../../db/managers/GuildManager.js';
import GuildDao from  '../../db/dao/GuildDao.js';
const guildManager = GuildManager.getInstance();

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
		.addStringOption(option =>
			option
				.setName('managment_port')
				.setDescription('the port used for minecraft`s Management Server'))
		.addStringOption(option =>
			option
				.setName('managment_password')
				.setDescription('the port used for minecraft`s Management Server'))

		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply({ flags: MessageFlags.Ephemeral });
	const { guildId, user } = event;
	const newServer = new GuildDao({
		guild_id: guildId,
		guild_name: "",
		admin_hook: event.options.getString('adminhook') ?? event.options.getString('webhook'),
		watcher_hook: event.options.getString('webhook'),
		server_ip: event.options.getString('server_ip'),
		query_port: parseInt(event.options.getString('query_port')),
		rcon_port: null,
		rcon_pwd: null,
		disabled: false,
		false_posetive: false,
		disabled_timer: null,
		disabled_reset_timer: null,
		manager_password: event.options.getString('managment_password'),
		manager_port: event.options.getString('managment_port'),
	});

	await guildManager.save(newServer);

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Guild Config')
		.addFields(
			{ name: "ID", value: `${newServer.getGuildId()}` },
			{ name: "WebHook", value: `${newServer.getWatcherHook()}` },
			{ name: "AdminHook", value: `${newServer.getAdminHook()}` },
			{ name: "Mincraft IP", value: `${newServer.getServerIp()}` },
			{ name: "Query Port", value: `${newServer.getQueryPort()}` },
			{ name: "Management Server Port", value: `${newServer.getManagerPort()}` },
			{ name: "Management Server Password", value: `${newServer.getManagerPwd()}` },
			{ name: "Avatar's", value: `Login: **${newServer.getMojavatar().login.pose}** \nLogout: **${newServer.getMojavatar().logout.pose}**`}
		);

	await event.followUp({
			embeds: [embed],
			files: [file]
		});
};