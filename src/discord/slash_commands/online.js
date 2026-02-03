import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from 'discord.js';
import { mojang_get_uuid, get_avatar_head } from '../../utils/mojang_api.js';
import GuildMembersManager from '../../db/managers/GuildMembersManager.js';

const guildMembersManager = GuildMembersManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('online')
		.setDescription('Who is online')
		.setNSFW(false);

export async function execute(event) {
		await event.deferReply();			// Send a "wait" message to Discord api
		const { guildId, user } = event;
		
		const message = new EmbedBuilder()
		.setColor('Gold')
		.setTitle("These players are online");

		const guildMemberDto = (await guildMembersManager.getAllGuildMembers(guildId))
			.filter(user => user.getOnline());		

		for (const memberDto of guildMemberDto) {
			message.addFields({ name: memberDto.getUserName(), value:"" })
		}

		if (guildMemberDto.length < 1) message.setDescription("Currently **no one** is online..");
		else {
			message.setTitle("These players are online");
		}
			
		await event.followUp({
			ephemeral: true,
			embeds: [message]
		});
	}


