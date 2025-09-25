import {
	Client, GatewayIntentBits, Events,
	Collection, MessageFlags, 
	EmbedBuilder, WebhookClient 
} from 'discord.js';

class DiscordClient {
	static instance;
	
	client  = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers
		],
	});

	constructor() {
		if(DiscordClient.instance) {
			return DiscordClient.instance;
		}
		DiscordClient.instance = this;
	}
}

const discordClient = new DiscordClient();

export default discordClient.client;