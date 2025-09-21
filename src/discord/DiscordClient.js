import {
	Client, GatewayIntentBits, Events,
	Collection, MessageFlags, 
	EmbedBuilder, WebhookClient 
} from 'discord.js';

import commands from '../discord_commands/index.js';

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

// Load the commands
discordClient.client.commands = new Collection();
await commands;

for(const [key, value] of Object.entries(commands))
{
	// Set a new item in the Collection with the key as the command name and 
	// the value as the exported module
	if ('data' in value && 'execute' in value) {
		discordClient.client.commands.set(value.data.name, value);
	} 
};

/*
	Discord event handlers
*/
discordClient.client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/*
	Handle slash-commands
*/
discordClient.client.on(Events.InteractionCreate, async (event) => {
	if(!event.isChatInputCommand()) return;
	
	//console.log(event.member.user);
	const command = event.client.commands.get(event.commandName);
	
	if(!command) {
		console.error(`No command matching ${event.commandName} was found.`)
		return;
	}

	try {
		await command.execute(event);
	}
	catch (error) {
		console.error(error);

		if (event.replied || event.deferred) {
			await event.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} 
		else {
			await event.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

export default discordClient.client;