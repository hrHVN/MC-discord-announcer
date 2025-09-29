import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

const LOG = (message) => console.log("[DEBUG] - ", ...message);


function server_overdue(tsA, tsB, diff = 60_000) {
  // Guard against invalid dates
  if (!tsA || !tsB) {
    return false;
  }

  // Convert whatever we got into millisecond numbers
  const t1 = new Date(tsA).getTime();
  const t2 = new Date(tsB).getTime();
  const diffMs = Math.abs(t1 - t2);
  LOG(['Server_overdue ' ,t1,t2, diffMs > diff])
  return diffMs > diff;
}

describe('Testing Server_overdue()', () => { 
	const fn = mock.fn();
	mock.timers.enable({ apis: ['setTimeout'] });

	it('Testing default config', async () => {

		await it('Passing 60 seconds test', () => {
			let now = Date.now();
			let _s5 = now + 5_000;

			let test = server_overdue(now, _s5);
			assert.strictEqual(test, false);
		});

		await it('Failing 60 seconds test', () => {
			let now = Date.now();
			let _s60 = now + 63_000;

			let test = server_overdue(now, _s60);
			assert.notEqual(test, false);
		});

		await it('Failing 1 Hour test', () => {
			let now = Date.now();
			let _1H = now + 3_700_000;
			
			setTimeout(fn, 3_700_000);
			mock.timers.tick(3_700_000);
			
			let test = server_overdue(now, _1H, 3_600_000);

			assert.notEqual(test, false);
		});

		mock.reset();

	});

});