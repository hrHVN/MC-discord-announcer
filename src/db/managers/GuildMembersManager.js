import DatabaseManager from './DatabaseManager.js';
import GuildMemberDao from  '../dao/GuildMemberDao.js';

export default class GuildMembersManager extends DatabaseManager {
	static #instance;
	
	constructor() {
		super();
	}

	static getInstance() {
		if (!GuildMembersManager.#instance){
			GuildMembersManager.#instance = new GuildMembersManager();
		}
		return GuildMembersManager.#instance;
	}

	async save(guildMemberDao) {
		try {
			let data = guildMemberDao.toPlainObject();
		    const sql = `
		      INSERT OR REPLACE INTO guildmembers (guild_id, user_name, last_seen, online)
		      VALUES (?, ?, ?, ?)
		      ON CONFLICT(guild_id, user_name) DO UPDATE SET
				last_seen 	= excluded.last_seen,
				online 		= excluded.online;
		    `.trim();
		
		    await this.query(sql, [
		    	data.guild_id,
		    	data.user_name,
		    	data.last_seen,
		    	data.online
		    ]);
		}
		catch (e) {
			console.error("[ERROR] - GuildMembersManager.save(): %s - ", e.message, e);
		}
	}

	async getAllGuildMembers(guild_id) {
		try {
			const rows = await this.query("SELECT * FROM guildmembers where guild_id = ?", 
					[ guild_id ]);
		
			if (!rows) return [];
			return rows.map(row => new GuildMemberDao(row));
		}
		catch (e) {
			console.error("[ERROR] - GuildMembersManager.getAllGuildMembers(): %s - ", e.message, e);
		}
	}

	async getMemeberByName(guild_id, member_name) {
		try {
			const rows = await this.query("SELECT * FROM guildmembers WHERE guild_id = ? AND member_name", 
				[ guildId, member_name ]);		
			return new guildMemberDao(row[0]);
		}
		catch (e) {
			console.error("[ERROR] - GuildMembersManager.getMemeberByName(): %s - ", e.message, e);
		}
	}

	async deleteGuild(guildId){
		try {
			return await this.query("DELETE FROM guildmembers WHERE guild_id = ?", [ guildId ]);
		}
		catch (e) {
			console.error("[ERROR] - GuildMembersManager.deleteGuild(): %s - ", e.message, e);
		}
	}
}
