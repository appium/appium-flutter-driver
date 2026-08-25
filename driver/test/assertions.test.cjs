const assert = require('node:assert/strict');
const {it} = require('node:test');

const {assertVisible} = require('../build/lib/commands/assertions.js');

it('loads the ESM finder from the CommonJS driver', async () => {
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
