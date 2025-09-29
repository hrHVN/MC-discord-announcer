import { 
  describe, it, mock, beforeEach, afterEach 
} from 'node:test';
import assert from 'node:assert/strict';
import { promises as fsPromises } from 'node:fs';

const LOG = (message) => console.log("[DEBUG] - ", ...message);

export async function CreateFreshInstance() {
  mock.restoreAll();

  const readMock = mock.method(
    fsPromises,
    'readFile',
    async () => JSON.stringify([])
  );
  
  const writeMock = mock.method(
    fsPromises,
    'writeFile',
    async () => undefined
  );

  const { default: onlinePlayers } = await import('../minecraft_server/OnlinePlayers.js');
  
  return onlinePlayers;
};


describe('Handling manipulation of server objects', async () => {
  beforeEach(() => {});
  const mockStorage = await CreateFreshInstance();

  it('Storing new Objects', async () => {
    let guild_id = 200200,
    admin_hook = "https://admin200200",
    watcher_hook = "https://watcher200200",
    server_ip = '127.0.0.1',
    query_port = 25565;

    await mockStorage.addServer(guild_id,admin_hook,watcher_hook, server_ip,query_port);

    assert.strictEqual(mockStorage.data.length, 1);
    assert.strictEqual(mockStorage.data[0].guild_id, guild_id);
    assert.strictEqual(mockStorage.data[0].admin_hook, admin_hook);
    assert.strictEqual(mockStorage.data[0].watcher_hook, watcher_hook);
    assert.strictEqual(mockStorage.data[0].server_ip, server_ip);
    assert.strictEqual(mockStorage.data[0].query_port, query_port);

  });

  it('Geting the Objects', async () => {
    assert.strictEqual(mockStorage.data.length, 1);
    const data = mockStorage.data[0];
    
    assert.strictEqual(data.disabled, false);
    assert.strictEqual(data.falsePosetive, null);
    assert.strictEqual(data.disabled_timer, null);
    assert.strictEqual(data.disabled_reset_timer, null);
    assert.strictEqual(data.server_name, null);
    
    assert.strictEqual(data.mojavatar.login.pose, "mojavatar");
    assert.strictEqual(data.mojavatar.logout.pose, "sleeping");

  });

  it('Updating a Object', async () => {
    await mockStorage.updateServer(200200,{
      server_suspension_multiplier: 22,
      server_name: "Mock Server",
      rcon_port: 7575,
    })
    const updated = mockStorage.data[0];

    assert.strictEqual(updated.server_name, "Mock Server");
    assert.strictEqual(updated.server_suspension_multiplier, 22);
    assert.strictEqual(updated.rcon_port, 7575);
  });

  it('Deleting a Object', async () => {
    await mockStorage.removeServer(200200);

    assert.strictEqual(mockStorage.data.length, 0);
  });

});