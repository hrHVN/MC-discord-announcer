import  WebSocket  from 'ws';
import handleMessages from './handleMessages.js'
export const servers = {};

export class MinecraftSocketeer {

  constructor(serverip, managerPort, mangerToken, guildId) {
    this.serverip = serverip;
    this.managerPort = managerPort;
    this.mangerToken = mangerToken;
    this.guildId = guildId;

    this.ws = new WebSocket(`ws://${this.serverip}:${this.managerPort}`, {
      headers: {
        Authorization: `Bearer ${this.mangerToken}`
      }
    });

    this.ws.on("open", () => {
      console.log("Ws Open")
      this.serverStatus();
    });

    this.ws.on("message", data => {
      data = data.toString('utf-8');
      let parsed = JSON.parse(data);

      let method = parsed.method;
      let params = parsed.params ? parsed.params : [];

      handleMessages(this.guildId, method, parsed)
    });

    this.ws.on("error", err => {
      err = err.toString('utf-8');
      let parsed = JSON.parse(err);
      console.error(`${this.serverip}:`, parsed)
    });

    this.ws.on("close", (data) => {
      console.log(`${this.serverip}: disconnected`, data)
    });
  }

  getId() { return this.guildId };

  close() {
    this.ws.close();
  }

  sendRPC(method, params = []) {
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params
    });

    this.ws.send(payload);
  }

   async sendMessage(msg) {
    this.sendRPC("minecraft:server/system_message", [{ 
      //receivingPlayers: [],
      overlay: false,
      message: { literal: msg }
    }]);
  } 

  async saveServer() { this.sendRPC("minecraft:server/save",[ { flush:true } ])  }

  async stopServer() { this.sendRPC("minecraft:server/stop")  }

  async serverStatus() { this.sendRPC("minecraft:server/status")  }

  async onlinePlayers(id) { 
    const payload = JSON.stringify({
      jsonrpc: "2.0", id, method:"minecraft:players"
    });
    this.ws.send(payload);
  }

  async whiteList(playerName) {
    if (playerName) {
      this.sendRPC("minecraft:allowlist/add", [{ add: [{ name: playerName }] }]);
    } 

    this.sendRPC("minecraft:allowlist");
  }

  async whiteListRemove(playerName) {
    this.sendRPC("minecraft:allowlist/remove", [{ remove: [{ name: playerName }] }]);
  }

  async operatorList(player, permission = 2, bypass = false) {
    this.sendRPC("minecraft:operators/add", [{
      add: { 
        player: { name: playerName },
        permissionLevel: permission,
        bypassesPlayerLimit: bypass
      }
    }]);
  }

  async removeOperator(playerName) {
    this.sendRPC("minecraft:operators/remove", [{ 
      remove: { player: { name: playerName } } 
    }]);
  }

  async banIp(reason = "Mischief", expires, source, ip) {
    const userban = {
      reason, expires, source,ip
    }
  }

  async banUser(reason = "Mischief", expires, source, player) {
    const userban = {
      reason, expires, source,
      player: playerObject("player"),
    }
  }

  async kickUser(mesage, player) {
    const userKick = {
      message: message("Take a walk .."),
      player: playerObject("player"),
    }
  }

}