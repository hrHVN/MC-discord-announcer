import dotenv from 'dotenv';
import Query from 'mcquery';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { 
	EmbedBuilder, WebhookClient 
} from 'discord.js';
import { onlinePlayers } from './mcQuery/mc_q_fn.js';
import { Discord_Update_Commands } from './discord_restapi/discord_rest.js';
import commands from './discord_commands/index.js';
import discordClient from './discord/DiscordClient.js';

dotenv.config();

/*
	Minecraft Query varaibles
*/
const mc_query = new Query(process.env.MC_SERVER_URL, process.env.MC_SERVER_PORT);

/*
	Discord Variables
*/
//	WebHooks Spidy Bot
const Admin_webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_ADMIN });
const ForeverWorld_webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_FF });

const WH_sendAdmin = async (message) => 				console.log(`[BOT] Spidey Bot: \n${message}`);// Admin_webhook.send({ content: message,username: '[BOT] Spidey Bot'	});
const WH_sendForeverWorld = async (message) => 	console.log(`[BOT] Captain Hook - Server Watcher: \n${message}`);// ForeverWorld_webhook.send({content: message,username: '[BOT] Captain Hook - Server Watcher'});
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
/*
	fullBack {
	  type: 0,
	  sessionId: 1,
	  hostname: "Minecraft Server",
	  gametype: 'SMP',
	  game_id: 'MINECRAFT',
	  version: '1.21.8',
	  plugins: '',
	  map: 'world',
	  numplayers: '0',
	  maxplayers: '16',
	  hostport: '25565',
	  hostip: 'xx.xx.xx.xx',
	  player_: [],
	  from: { address: 'xx.xx.xx.xx', port: xx }
	}
*/
  if (err) {
    console.error(err)
  }
  //console.log('fullBack', stat)
  
  shouldWeClose();

  WH_sendAdmin(`
## This bot just rebooted!
_Current minecraft server stats_
**Server Name**: ${stat.hostname}
**Server Version**: ${stat.version}
**Players Online**: ${stat.numplayers} / ${stat.maxplayers}
	`);
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
discordClient.login(process.env.DISCORD_TOKEN);

/*
	Query the minecraft server for change in users
*/
mc_query.connect()
	.then(()=>{
    	console.log('Initiating Querying protocoll');
    	
    	mc_query.full_stat(fullStatBack);
    	mc_query.full_stat(players_logedinn);
	})
.catch(err => console.error("error connecting", err));

setInterval(()=>{
	mc_query.connect()
	.then(()=>{
    	mc_query.full_stat(players_logedinn);
	})
	.catch(err => console.error("error connecting", err));
}, 15000);