/**
 * Data‑access‑object representation of the `guildmembers` table.
 *
 * Columns (as defined in the schema):
 *  id         INTEGER PRIMARY KEY AUTOINCREMENT
 *  guild_id   BIGINT   NOT NULL
 *  user_name  TEXT     NOT NULL
 *  last_seen  TEXT     NOT NULL DEFAULT (datetime('now'))
 *  online     BOOLEAN DEFAULT 1
 */
export default class GuildMemberDao {
  _id;
  _guildId;
  _userName;
  _lastSeen;
  _online;

  constructor(data = {}) {
    this.setId(data.id ?? null);
    this.setGuildId(data.guild_id);
    this.setUserName(data.user_name);
    this.setLastSeen(data.last_seen);
    this.setOnline(data.online);
  }

  getId() {
    return this._id;
  }
  setId(value) {
    this._id = value;
  }

  getGuildId() {
    return this._guildId.toString();
  }
  setGuildId(value) {
    this._guildId = BigInt(value);
  }

  getUserName() {
    return this._userName;
  }
  setUserName(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new TypeError('user_name must be a non‑empty string');
    }
    this._userName = value.trim();
  }

  getLastSeen() {
    return this._lastSeen;
  }
  setLastSeen(value) {
    if (value === null) {
      // Allow null so SQLite can apply its DEFAULT (datetime('now'))
      this._lastSeen = null;
      return;
    }
    if (typeof value !== 'string') {
      throw new TypeError('last_seen must be a string (ISO‑date/time) or null');
    }
    // Very light validation – you could enforce ISO‑8601 if desired
    this._lastSeen = value;
  }

  getOnline() { return this._online; }
  setOnline(value) { 
    this._online = Boolean(value); 
  }

  toPlainObject() {
    return {
      id: this.getId(),
      guild_id: this.getGuildId(),
      user_name: this.getUserName(),
      last_seen: this.getLastSeen(),
      online: this.getOnline()
    };
  }
}