import assert from 'node:assert/strict';
import {it} from 'node:test';

import {assertVisible, isAbsent, isNotVisible, isTappable, isVisible} from '../build/lib/commands/assertions.js';
import {execute} from '../build/lib/commands/execute.js';

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

it('returns true from isVisible, isNotVisible, isAbsent, and isTappable when executeElementCommand succeeds', async () => {
  const calls = [];
  const driver = {
    executeElementCommand: async (command, finder, options) => {
      calls.push({command, finder, options});
    },
  };

  assert.equal(await isVisible(driver, {key: 'enabled-button'}, 3000), true);
  assert.equal(await isNotVisible(driver, {text: 'Hidden'}, 1500), true);
  assert.equal(await isAbsent(driver, {label: 'Gone'}, 1000), true);
  assert.equal(await isTappable(driver, {key: 'submit'}, 2000), true);

  assert.equal(calls.length, 4);
  assert.equal(calls[0].command, 'waitFor');
  assert.deepEqual(calls[0].options, {timeout: 3000, visible: true});
  assert.equal(calls[1].command, 'waitForAbsent');
  assert.deepEqual(calls[1].options, {timeout: 1500});
  assert.equal(calls[2].command, 'waitForAbsent');
  assert.deepEqual(calls[2].options, {timeout: 1000});
  assert.equal(calls[3].command, 'waitForTappable');
  assert.deepEqual(calls[3].options, {timeout: 2000});
});

it('returns false from isVisible, isNotVisible, isAbsent, and isTappable when element does not exist or times out', async () => {
  const driver = {
    executeElementCommand: async () => {
      throw new Error('Cannot execute command waitFor, server response {"isError":true}');
    },
  };

  assert.equal(await isVisible(driver, {key: 'disabled-button'}, 1000), false);
  assert.equal(await isNotVisible(driver, {key: 'present-button'}, 1000), false);
  assert.equal(await isAbsent(driver, {key: 'present-button'}, 1000), false);
  assert.equal(await isTappable(driver, {key: 'disabled-button'}, 1000), false);
});

it('dispatches flutter:isVisible, flutter:isNotVisible, flutter:isAbsent, and flutter:isTappable via execute', async () => {
  let shouldFail = false;
  const driver = {
    executeElementCommand: async () => {
      if (shouldFail) {
        throw new Error('Timed out');
      }
    },
  };

  assert.equal(await execute.call(driver, 'flutter:isVisible', [{key: 'btn'}, 1000]), true);
  assert.equal(await execute.call(driver, 'flutter:isNotVisible', [{key: 'btn'}, 1000]), true);
  assert.equal(await execute.call(driver, 'flutter:isAbsent', [{key: 'btn'}, 1000]), true);
  assert.equal(await execute.call(driver, 'flutter:isTappable', [{key: 'btn'}, 1000]), true);

  shouldFail = true;
  assert.equal(await execute.call(driver, 'flutter:isVisible', [{key: 'btn'}, 1000]), false);
  assert.equal(await execute.call(driver, 'flutter:isNotVisible', [{key: 'btn'}, 1000]), false);
  assert.equal(await execute.call(driver, 'flutter:isAbsent', [{key: 'btn'}, 1000]), false);
  assert.equal(await execute.call(driver, 'flutter:isTappable', [{key: 'btn'}, 1000]), false);
});

it('accepts W3C WebElement objects and throws on invalid finder input', async () => {
  let receivedFinder;
  const driver = {
    executeElementCommand: async (_cmd, finder) => {
      receivedFinder = finder;
    },
  };

  const encoded = Buffer.from(JSON.stringify({finderType: 'ByText', text: 'Hello'})).toString('base64');
  assert.equal(await isVisible(driver, {'element-6066-11e4-a52e-4f735466cecf': encoded}, 500), true);
  assert.equal(receivedFinder, encoded);

  await assert.rejects(() => isVisible(driver, {}), /Invalid finder input/);
});

it('loads the driver entry point as ESM', async () => {
  const {FlutterDriver} = await import('../build/lib/driver.js');

  assert.equal(typeof FlutterDriver, 'function');
});
