# Intro
This bot query's a minecraft server for basic stats, like version, MOTD, player limit and who is online, and sends a message to the discord server when someone enters or leaves the minecraft server. 

The server have to enable "Query" in it's properties to be compatible with this bot.


# Disclaimer
This bot isn't really made for public use, and would not be usable as is by other Guilds or Minecraft servers. 

# .ENV variables
```
DISCORD_KEY		= the generated url from discord/developers
MC_SERVER_URL	= the server ip or url
MC_SERVER_PORT	= the server port [required]

DISCORD_TOKEN			= [BOT TOKEN]
DISCORD_ID				= [BOT ID]
DISCORD_PUB				= -- not used --
DISCORD_GUILD_ID 		= [ID of Discord server]
DISCORD_WEBHOOK_<NAME>	= [WEBHOOK URL]
```
# Sources
Sources used to build this bot.
[Minecraft Wiki](https://minecraft.wiki/w/Query#Example_implementations)
[Github node-mcquery](https://github.com/kmpm/node-mcquery/tree/master)
[Npm Discord.js](https://www.npmjs.com/package/discord.js)

