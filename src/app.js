import dotenv from 'dotenv';
import Query from 'mcquery';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import {
	Client, GatewayIntentBits, Events,
	Collection, MessageFlags, 
	EmbedBuilder, WebhookClient 
} from 'discord.js';
import { onlinePlayers } from './mcQuery/mc_q_fn.js';
import { Discord_Update_Commands } from './discord_restapi/discord_rest.js';
import commands from './discord_commands/index.js';

dotenv.config();

/*
	Minecraft Query varaibles
*/
const mc_query = new Query(process.env.MC_SERVER_URL, process.env.MC_SERVER_PORT);

/*
	Discord Variables
*/
const discord_Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	],
});

// Load the commands
	discord_Client.commands = new Collection();
	await commands;

	for(const [key, value] of Object.entries(commands))
	{
		console.log("app.js: ", key)
		// Set a new item in the Collection with the key as the command name and 
		// the value as the exported module
		if ('data' in value && 'execute' in value) {
			discord_Client.commands.set(value.data.name, value);
			//rest_commands.push(command.data.toJSON());
		} 
	};

/*
	Discord event handlers
*/
discord_Client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/*
	Handle slash-commands
*/
discord_Client.on(Events.InteractionCreate, async (event) => {
	if(!event.isChatInputCommand() 
		|| event.guildId !== process.env.DISCORD_GUILD_ID) return;
	
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

/*
	WebHook Spidy Bot
*/
const Admin_webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_ADMIN });
const ForeverWorld_webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_FF });
const WH_sendAdmin = async (message) => 				console.log(`[BOT] Spidey Bot: \n${message}`)// Admin_webhook.send({ content: message,username: '[BOT] Spidey Bot'	});
const WH_sendForeverWorld = async (message) => 	console.log(`[BOT] Captain Hook - Server Watcher: \n${message}`)// ForeverWorld_webhook.send({content: message,username: '[BOT] Captain Hook - Server Watcher'});
/*
	Minecraft Query event handlers
*/
async function playerOnline(player) {
	if (!player) return;

	// Save online players
	onlinePlayers.push(player);

	// Send discord message
	await WH_sendForeverWorld(`**${player}** is now Online!`);
}

async function playerOffline(player) {
	if (!player) return;
	// remove player from memory
	onlinePlayers.splice(onlinePlayers.indexOf(player),1);

	// Send discord message
	await WH_sendForeverWorld(`**${player}** left the server... \nBe back soon!`);
}

function fullStatBack (err, stat) {
  if (err) {
    console.error(err)
  }
  console.log('fullBack', stat)
  shouldWeClose();
}

function players_logedinn(err, stat) {
	if (err) {
    	console.error(err)
  }

  try {
		let { player_, sessionId, numplayers } = stat;
		
		player_.map(op => {
			if(!onlinePlayers.includes(op)){
				playerOnline(op);
			}
		});	

		// if onlinePlayers[x] not in player send logout event
		onlinePlayers.map(op => {
			if(!player_.includes(op)){
				playerOffline(op);
			}
		});

		shouldWeClose();
  }
  catch (error) {
  	console.log("[ERROR]: ", error);
  	shouldWeClose();
  	return;
  }
};

function shouldWeClose () {
  // have we got all answers
  if (mc_query.outstandingRequests === 0) {
    mc_query.close()
  }
}

/*
	Main Loop
*/
/*
	Try updating the available comands.
*/
Discord_Update_Commands();
/*
	Log in the bot
*/
discord_Client.login(process.env.DISCORD_TOKEN);
/*
	Query the minecraft server for change in users
*/
mc_query.connect()
	.then(()=>{
    	console.log('Initiating Querying protocoll');
    	if (process.env.NODE_ENV == "production") {
	    	const stats = mc_query.full_stat(fullStatBack);

    		WH_sendAdmin(`
## This bot just rebooted!
_Current minecraft server stats_
**Server Name**: ${hostname}
**Server Version**: ${version}
**Players Online**: ${numplayers} / ${maxplayers}
	`);
    	}
    	mc_query.full_stat(players_logedinn);
	})
.catch(err => console.error("error connecting", err));

setInterval(()=>{
	mc_query.connect()
	.then(()=>{
    	// console.log('Asking for stat');
    	// mc_query.full_stat(fullStatBack);
    	mc_query.full_stat(players_logedinn);
	})
	.catch(err => console.error("error connecting", err));
}, 15000);