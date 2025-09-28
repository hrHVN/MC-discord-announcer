import commands from './slash_commands/index.js';
import client  from './DiscordClient.js';
import { Events, Collection, MessageFlags } from "discord.js";

// await commands;

// Load the commands
client.commands = new Collection();

for(const [key, value] of Object.entries(commands))
{
	// Set a new item in the Collection with the key as the command name and 
	// the value as the exported module
	if ('data' in value && 'execute' in value) {
		client.commands.set(value.data.name, value);
	} 
};

/*
	Discord event handlers
*/
client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/*
	Handle slash-commands
*/
client.on(Events.InteractionCreate, async (event) => {
	if(!event.isChatInputCommand()) return;
	
	//console.log("Client_listener - client.on: ", event.options.getUser('target'));
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
			await event.followUp({ 
				content: 'There was an error while executing this command!', 
				flags: MessageFlags.Ephemeral 
			});
		} 
		else {
			await event.reply({ 
				content: 'There was an error while executing this command!', 
				flags: MessageFlags.Ephemeral 
			});
		}
	}
});