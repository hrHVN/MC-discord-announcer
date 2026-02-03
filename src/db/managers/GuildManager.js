import DatabaseManager from './DatabaseManager.js';
import GuildDao from  '../dao/GuildDao.js';

export default class GuildManager extends DatabaseManager {
	static #instance;
	
	constructor() {
		super();
	}

	static getInstance() {
		if (!GuildManager.#instance){
			GuildManager.#instance = new GuildManager();
		}
		return GuildManager.#instance;
	}

	async save(guildDao) {
		const data = guildDao.toPlainObject();
    	const values = [
    		data.guild_id,
    		data.guild_name,
			data.admin_hook,
			data.watcher_hook,
			data.server_ip,
			data.query_port,
			data.rcon_port,
			data.rcon_pwd,
			data.mojavatar,
			data.disabled,
			data.falsePosetive,
			data.disabled_timer,
			data.disabled_reset_timer
    	];
	
	    const sql = `
	      INSERT OR REPLACE INTO guilds (guild_id, guild_name,
				admin_hook, watcher_hook, server_ip, 
				query_port, rcon_port, rcon_pwd, mojavatar,
				disabled, falsePosetive, disabled_timer, disabled_reset_timer
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	      ON CONFLICT(guild_id) DO UPDATE SET
	    	guild_name 				= excluded.guild_name,
			admin_hook 				= excluded.admin_hook,
			watcher_hook 			= excluded.watcher_hook,
			server_ip 				= excluded.server_ip,
			query_port 				= excluded.query_port,
			rcon_port 				= excluded.rcon_port,
			rcon_pwd 				= excluded.rcon_pwd,
			mojavatar 				= excluded.mojavatar,
			disabled 				= excluded.disabled,
			falsePosetive 			= excluded.falsePosetive,
			disabled_timer 			= excluded.disabled_timer,
			disabled_reset_timer 	= excluded.disabled_reset_timer
	    `.trim();
	
	    await this.query(sql, values);
	}

	async getAllGuilds() {
		const rows = await this.query("SELECT * FROM guilds", []);
		if (!rows) return [];

		return rows.map(row => { return new GuildDao(row); });
	}

	async getGuildById(guildId) {
		const rows = await this.query("SELECT * FROM guilds WHERE guild_id = ?", [guildId]);
		
		return rows[0] 
		? new GuildDao(rows[0])
		: null;
	}

	async delete(guildId){
		return await this.query("DELETE FROM guilds WHERE guild_id = ?", [guildId]);
	}
}
