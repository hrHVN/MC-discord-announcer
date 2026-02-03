export default class GuildDao {
  _guildId;
  _guildName;
  _adminHook;
  _watcherHook;
  _serverIp;
  _queryPort;
  _rconPort;
  _rconPwd;
  _mojavatar;
  _disabled;
  _falsePosetive;
  _disabledTimer;
  _disabledResetTimer;

  constructor(data = {}) {
    this.setGuildId(data.guild_id);
    this.setGuildName(data.guild_name ?? null);
    this.setAdminHook(data.admin_hook ?? null);
    this.setWatcherHook(data.watcher_hook ?? null);
    this.setServerIp(data.server_ip ?? null);
    this.setQueryPort(data.query_port ?? null);
    this.setRconPort(data.rcon_port ?? null);
    this.setRconPwd(data.rcon_pwd ?? null);
    this.setMojavatar(data.mojavatar ??
          {"login": {"pose": "mojavatar","crop": "full"},"logout": {"pose": "sleeping","crop": "full"}});
    this.setDisabled(data.disabled ?? false);
    this.setFalsePosetive(data.false_posetive ?? false);
    this.setDisabledTimer(data.disabled_timer ?? null);
    this.setDisabledResetTimer(data.disabled_reset_timer ?? null);
  }

  getGuildId() {
    return this._guildId.toString();
  }
  setGuildId(value) {
      this._guildId = BigInt(value);
  }

  getGuildName() {
    return this._guildName;
  }
  setGuildName(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('guild_name must be a string or null');
    }
    this._guildName = value;
  }

  getAdminHook() {
    return this._adminHook;
  }
  setAdminHook(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('admin_hook must be a string or null');
    }
    this._adminHook = value;
  }

  getWatcherHook() {
    return this._watcherHook;
  }
  setWatcherHook(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('watcher_hook must be a string or null');
    }
    this._watcherHook = value;
  }

  getServerIp() {
    return this._serverIp;
  }
  setServerIp(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('server_ip must be a string or null');
    }
    this._serverIp = value;
  }

  getQueryPort() {
    return this._queryPort;
  }
  setQueryPort(value) {
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      throw new TypeError('query_port must be a non‑negative integer or null');
    }
    this._queryPort = value;
  }

  getRconPort() {
    return this._rconPort;
  }
  setRconPort(value) {
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      throw new TypeError('rcon_port must be a non‑negative integer or null');
    }
    this._rconPort = value;
  }

  getRconPwd() {
    return this._rconPwd;
  }
  setRconPwd(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('rcon_pwd must be a string or null');
    }
    this._rconPwd = value;
  }

  getMojavatar() { 
    return this._mojavatar; 
  } 
  setMojavatar(value) { 
    try { 
      if (typeof value == 'string' && value.startsWith("'") && value.endsWith("'")) {
        value = JSON.parse(value.slice(1, -1)); 
      }
      else if (typeof value == 'string'){
        value = JSON.parse(value); 
      }
    } catch (e) { 
      console.log(e)
      throw new Error('mojavatar must contain valid JSON'); 
    } 
    this._mojavatar = value; 
  }

  getDisabled() {
    return this._disabled;
  }
  setDisabled(value) {
    this._disabled = Boolean(value);
  }

  getFalsePosetive() {
    return this._falsePosetive;
  }
  setFalsePosetive(value) {
    this._falsePosetive = Boolean(value);
  }

  getDisabledTimer() {
    return this._disabledTimer;
  }
  setDisabledTimer(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('disabled_timer must be a string or null');
    }
    this._disabledTimer = value;
  }

  getDisabledResetTimer() {
    return this._disabledResetTimer;
  }
  setDisabledResetTimer(value) {
    if (value !== null && typeof value !== 'string') {
      throw new TypeError('disabled_reset_timer must be a string or null');
    }
    this._disabledResetTimer = value;
  }

  toPlainObject() {
    return {
      guild_id: this.getGuildId(),
      guild_name: this.getGuildName(),
      admin_hook: this.getAdminHook(),
      watcher_hook: this.getWatcherHook(),
      server_ip: this.getServerIp(),
      query_port: this.getQueryPort(),
      rcon_port: this.getRconPort(),
      rcon_pwd: this.getRconPwd(),
      mojavatar: JSON.stringify(this.getMojavatar()),
      disabled: this.getDisabled() ? 1 : 0,
      falsePosetive: this.getFalsePosetive() ? 1 : 0,
      disabled_timer: this.getDisabledTimer(),
      disabled_reset_timer: this.getDisabledResetTimer(),
    };
  }
}
