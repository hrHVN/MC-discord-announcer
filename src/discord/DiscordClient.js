import {
	Client, GatewayIntentBits, Events,
	Collection, MessageFlags, 
	EmbedBuilder, WebhookClient 
} from 'discord.js';

export default class DiscordClient {
	static instance;
	_client;
/*	client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers
		],
	});*/
	
	constructor(){
		this.setClient();
	}

	static getInstance() {
		if(!DiscordClient.instance) {
			DiscordClient.instance = new DiscordClient();
		}
		return DiscordClient.instance;
	}

	setClient(){
		this._client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers
		],
	});
	}

	getClient() {
		return this._client;
	}
}