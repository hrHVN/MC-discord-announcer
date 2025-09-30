import {
	AttachmentBuilder, SlashCommandBuilder, EmbedBuilder,
	PermissionFlagsBits, InteractionContextType 
} from 'discord.js';
import onlinePlayers from '../../minecraft_server/OnlinePlayers.js'

export const data = new SlashCommandBuilder()
		.setName('enable')
		.setDescription(`Disengage the MC Announcer.`)	
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setNSFW(false);

export async function execute(event) {
	await event.deferReply();

	const { guildId } = event;
	// reset all the timeout variables
	await onlinePlayers.updateServer(guildId,{ 
		disable: "false",
		disabled_reset_timer: "null",
		disabled_timer: "null",
		falsePosetive: "null",
		server_suspension_multiplier: 1,
	 });

	const server = onlinePlayers.data.find(d => d.guild_id == guildId);

	const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setThumbnail('attachment://Hive_ng_Fun-bee.png')
		.setTitle('Reenabled the Guild')
		.setDescription(`The ${ server.server_name ? server.server_name : server.server_ip } has been added to the Query Loop again!`);

	await event.followUp({
			ephemeral: true,
			embeds: [embed],
			files: [file]
		});
};