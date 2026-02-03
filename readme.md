# Intro
This bot query's a minecraft server for basic stats, like version, MOTD, player limit and who is online, and sends a message to the discord server when someone enters or leaves the minecraft server. 

The server have to enable "Query" in it's properties to be compatible with this bot. 

# .ENV variables
```
DISCORD_TOKEN			= [BOT TOKEN]
DISCORD_ID				= [BOT ID]
DISCORD_PUB				= -- not used yet --
DISCORD_UPDATE			= false  # used to trigger a slash-comand-update, only run once with true, then restart with false. 
```
# Sources
Sources used to build this bot.

[Minecraft Wiki](https://minecraft.wiki/w/Query#Example_implementations)

[Github node-mcquery](https://github.com/kmpm/node-mcquery/tree/master)

[Npm Discord.js](https://www.npmjs.com/package/discord.js)

[Discord.js Docs](https://discordjs.guide/creating-your-bot/)

[Isometric rendering](https://crafatar.com)

[lunareclipse.studio](https://docs.lunareclipse.studio/)

[Mojang API](https://minecraft.wiki/w/Mojang_API)

[MC-WebSocket](https://minecraft.wiki/w/Minecraft_Server_Management_Protocol)

## Docker Debug comands

`$ sudo docker build -t mcbot:latest -f Dockerfile . --no-cache`

`$ sudo docker build -t mcbot:latest -f Dockerfile .`

`$ sudo docker compose -f test-compose.yml up`

### Discord Embed colour support
| Default 	| White		 | Aqua 		| Green 			| Blue | 
| Yellow 	| Purple	 | LuminousVividPink  | Fuchsia 	| Gold | 
| Orange 	| Red		 | Grey 		| Navy 				| DarkAqua | 
| DarkGreen | DarkBlue	 | DarkPurple 	| DarkVividPink 	| DarkGold | 
| DarkOrange| DarkRed	 | DarkGrey 	| DarkerGrey 		| LightGrey | 
| DarkNavy	| Blurple	 | Greyple 		| DarkButNotBlack 	| NotQuiteBlack | 
| Random
