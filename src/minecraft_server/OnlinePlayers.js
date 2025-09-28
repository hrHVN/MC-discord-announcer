import Query from 'mcquery';
import { loadJson, addEntry, removeGuild } from '../utils/json_tools.js';
import path from 'node:path';

const servers = path.join(
	path.resolve('json'),
	'registered_servers.json'
	);

//export const onlinePlayers = await loadJson(servers);

class OnlinePlayers {
	static instance;
	
	data;

	constructor() {
		if(OnlinePlayers.instance) {
			return OnlinePlayers.instance;
		}
		OnlinePlayers.instance = this;
	}
	/*
		Initialize the Server in memory
	*/
	async addServer(guild_id,
		admin_hook,watcher_hook, 	// WebHooks
		server_ip,query_port		// minecraft data
		) {
		const newServer = {
			disabled: 				false,
			falsePosetive: 			null,
    		disabled_timer: 		null,
    		disabled_reset_timer: 	null,
    		server_name: 			null,
			guild_id: 				guild_id,
			admin_hook: 			admin_hook || "",
			watcher_hook: 			watcher_hook,
			server_ip: 				server_ip,
			query_port: 			query_port || 25565 ,
			rcon_port: 				null,
			rcon_pwd: 				null,
			online_players: 		[], 
			mojavatar: { 
				login: { pose: "mojavatar", crop : "full" },
				logout: { pose: "sleeping", crop : "full" }
		 	}
		};

		await addEntry(servers, newServer);

		this.data.push(newServer);
	}
	/*
		Update Saved values
	*/
	async updateServer(guild_id,{
			disabled,
			falsePosetive,
			disabled_timer,
			disabled_reset_timer,
			server_suspension_multiplier,
			admin_hook,
			server_name,
			watcher_hook,
			server_ip,
			query_port,
			rcon_port,
			rcon_pwd,
			mojavatar
		}) {
		
		// get the current data
		const _current = this.data.find(server => server.guild_id == guild_id);
		// save a new temp object
		const _newJson = {
			disabled: 			  disabled 				|| _current?.disabled 				,//|| false,
			falsePosetive: 		  falsePosetive			|| _current?.falsePosetive 			,//|| null,
			disabled_timer: 	  disabled_timer		|| _current?.disabled_timer 		,//|| null,
			disabled_reset_timer: disabled_reset_timer	|| _current?.disabled_reset_timer 	,//|| null,
			server_name: 		  server_name 			|| _current?.server_name 			,//|| null,
			admin_hook: 		  admin_hook			|| _current.admin_hook,
			watcher_hook: 		  watcher_hook			|| _current.watcher_hook,
			server_ip: 			  server_ip				|| _current.server_ip,
			query_port: 		  query_port			|| _current.query_port,
			rcon_port: 			  rcon_port				|| _current.rcon_port,
			rcon_pwd: 			  rcon_pwd				|| _current.rcon_pwd,
			guild_id: 			  _current.guild_id,
			online_players: 	  _current.online_players, 
			server_suspension_multiplier: 
				server_suspension_multiplier 
				|| _current?.server_suspension_multiplier 
				|| 1 ,			
			mojavatar: { 
				login: { 
					pose: mojavatar?.login.pose  || _current.mojavatar.login.pose, 
					crop : mojavatar?.login.crop || _current.mojavatar.login.crop 
				},
				logout: { 
					pose: mojavatar?.logout.pose  || _current.mojavatar.logout.pose, 
					crop : mojavatar?.logout.crop || _current.mojavatar.logout.crop
				}
			}
		};

		if (query_port){ 
			_newJson.query_port				= query_port;
			_newJson.disabled				= false;
			_newJson.falsePosetive			= null;
			_newJson.disabled_timer			= null;
			_newJson.disabled_reset_timer	= null;	
		}

		if (mojavatar) {
			for(let key of Object.keys(mojavatar)){
				_newJson.mojavatar[key] = mojavatar[key];
			}
		}

		await this.removeServer(guild_id);
		
		this.data.push(_newJson);
		
		await addEntry(servers, _newJson);
		return true;
	}
	/*
		Delete the Guild
	*/
	async removeServer(uuid) {
		await removeGuild(servers, uuid);

		let index = this.data.findIndex(d => d.guild_id === uuid);

  		this.data.splice(index, 1);
	}
}

const onlinePlayers = new OnlinePlayers();
onlinePlayers.data = await loadJson(servers);

export default onlinePlayers;