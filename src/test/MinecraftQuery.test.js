import { 
  describe, it, mock, beforeEach, afterEach 
} from 'node:test';
import assert from 'node:assert/strict';

describe('Handling manipulation of server objects', { todo: true } , async () => {
  it('Storing new Objects', { todo: true } ,async () => {

  });
});

export default class QueryMock {
  /** @type {number} */
  outstandingRequests = 0;

  /** @type {Array<Function>} */
  _connectResolvers = [];
  _connectRejectors = [];

  /** @type {Array<{cb:Function, err?:any}>} */
  _fullStatCalls = [];

  constructor(serverUrl, serverPort, options) {
    // capture ctor args if you need to assert on them later
    this.serverUrl = serverUrl;
    this.serverPort = serverPort;
    this.options = options;
  }

  /** Simulate a successful connection */
  resolveConnect() {
    this._connectResolvers.forEach(r => r());
    this._clearConnectHandlers();
  }

  /** Simulate a failed connection */
  rejectConnect(error) {
    this._connectRejectors.forEach(r => r(error));
    this._clearConnectHandlers();
  }

  /** Called by the production code */
  connect() {
    this.outstandingRequests++; // mimic that a request is now pending
    return new Promise((resolve, reject) => {
      this._connectResolvers.push(resolve);
      this._connectRejectors.push(reject);
    });
  }

  /** Called by the production code */
  full_stat(cb) {
    // The production code will decrement outstandingRequests when it finishes.
    // We let the test decide when to invoke the callback.
    this._fullStatCalls.push({ cb });
  }

  /** Helper for the test to fire the full_stat callback */
  triggerFullStat(err, stat) {
    // Decrement the pending counter – the real library does this internally.
    this.outstandingRequests = Math.max(0, this.outstandingRequests - 1);
    this._fullStatCalls.forEach(call => call.cb(err, stat));
    this._fullStatCalls = []; // clear after use
  }

  /** Close is a no‑op in the mock, but we record that it was called */
  closeCalled = false;
  close() {
    this.closeCalled = true;
  }

  _clearConnectHandlers() {
    this._connectResolvers = [];
    this._connectRejectors = [];
  }
}