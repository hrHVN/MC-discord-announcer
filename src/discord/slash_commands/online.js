import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from 'discord.js';
import { mojang_get_uuid, get_avatar_head } from '../../utils/mojang_api.js';
import GuildMembersManager from '../../db/managers/GuildMembersManager.js';
import websocketEvents from "../../minecraft_server/management_server/WebsocketEvents.js";
import { servers } from "../../minecraft_server/management_server/ManagementServer.js";

const guildMembersManager = GuildMembersManager.getInstance();

export const data = new SlashCommandBuilder()
		.setName('online')
		.setDescription('Who is online')
		.setNSFW(false);

export async function execute(event) {
		await event.deferReply({ flags: MessageFlags.Ephemeral });
		const { guildId, user } = event;
		const id = Date.now();
		let wsEvent = `${guildId}:${id}`;

		const message = new EmbedBuilder()
		.setColor('Gold')
		.setTitle("These players are online");

		const socketeer = servers[guildId];
		if (!socketeer) {
			await event.followUp({
  				content: 'Can not reach the server. The game server may be offline.',
  				flags: MessageFlags.Ephemeral
  			});
  			return;
		}

		const timeout = setTimeout(async () => {
  			websocketEvents.removeListener(wsEvent, handler);

  			await event.followUp({
  				content: 'Request timed out. The game server may be offline.',
  				flags: MessageFlags.Ephemeral
  			});
  		}, 30_000);
		
		async function handler(data) {
			clearTimeout(timeout);
			websocketEvents.removeListener(wsEvent, handler);

			data.result.forEach(member => {
				message.addFields({ name: member.name, value:"" })
			});
			
			if (data.result.length < 1) {
				message.setDescription("Currently **no one** is online..");
			}
			else {
				message.setTitle("These players are online");
			}

			await event.followUp({
				embeds: [message]
			});

			console.log("looping listeners?", websocketEvents.listeners(wsEvent))
		}

		websocketEvents.once(wsEvent, handler)
		socketeer.onlinePlayers(id);
	}


