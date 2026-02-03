CREATE TABLE IF NOT EXISTS guilds (
	id 						INTEGER PRIMARY KEY AUTOINCREMENT,
	guild_id 				TEXT NOT NULL UNIQUE,
	guild_name 				TEXT,
	admin_hook 				TEXT,
	watcher_hook			TEXT,
	server_ip				TEXT,
	query_port				INTEGER,
	rcon_port				INTEGER,
	rcon_pwd				TEXT,
	mojavatar				TEXT,
	disabled 				BOOLEAN DEFAULT 0,
	falsePosetive			BOOLEAN DEFAULT 0,
	disabled_timer  		TEXT,
	disabled_reset_timer	TEXT
);

CREATE TABLE IF NOT EXISTS guildmembers (
	id 				INTEGER PRIMARY KEY AUTOINCREMENT,
	guild_id 		TEXT 	NOT NULL,
	user_name 		TEXT 	NOT NULL,
	last_seen		TEXT 	NOT NULL DEFAULT (datetime('now')),
	online			BOOLEAN DEFAULT 1,
	UNIQUE (guild_id, user_name)
);
