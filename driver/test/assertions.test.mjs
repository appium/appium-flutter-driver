import assert from 'node:assert/strict';
import {it} from 'node:test';

import {assertVisible} from '../build/lib/commands/assertions.js';

it('loads the ESM finder from the ESM driver', async () => {
  let command;
  let finder;
  let options;
  const driver = {
    executeElementCommand: async (...args) => {
      [command, finder, options] = args;
    },
  };

  await assertVisible(driver, {key: 'example'});

  assert.equal(command, 'waitFor');
  assert.deepEqual(JSON.parse(Buffer.from(finder, 'base64url').toString()), {
    finderType: 'ByValueKey',
    keyValueString: 'example',
    keyValueType: 'String',
  });
  assert.deepEqual(options, {timeout: 5000, visible: true});
});

it('loads the driver entry point as ESM', async () => {
  const {FlutterDriver} = await import('../build/lib/driver.js');

  assert.equal(typeof FlutterDriver, 'function');
});
