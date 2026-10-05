import assert from 'node:assert/strict';
import {afterEach, beforeEach, it, mock} from 'node:test';

import {XCUITestDriver} from 'appium-xcuitest-driver';

import {startIOSSession} from '../build/lib/sessions/ios.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}};
const w3cCaps = (alwaysMatch = {}, firstMatch = [{}]) => ({alwaysMatch, firstMatch});

let forwardedArgs;

beforeEach(() => {
  forwardedArgs = undefined;
  mock.method(XCUITestDriver.prototype, 'createSession', async (...args) => {
    forwardedArgs = args;
  });
});

afterEach(() => mock.restoreAll());

// Without `app`/`bundleId`, startIOSSession returns right after creating the XCUITest session,
// so these tests only exercise what gets forwarded to XCUITest.
const start = (caps, ...args) => startIOSSession.call({log: noopLog}, caps, ...args);

it('forwards the injected VM service flags to XCUITest', async () => {
  const caps = {dartVmServicePort: 9123, processArguments: {args: ['--foo'], env: {A: '1'}}};
  const forwarded = w3cCaps({'appium:dartVmServicePort': 9123}, [
    {'appium:processArguments': {args: ['--foo'], env: {A: '1'}}},
  ]);

  await start(caps, forwarded, undefined, {});

  assert.equal(forwardedArgs[0], forwarded);
  assert.deepEqual(forwarded.alwaysMatch['appium:processArguments'], {
    args: ['--foo', '--vm-service-port=9123', '--disable-service-auth-codes'],
    env: {A: '1'},
  });
  assert.deepEqual(forwarded.firstMatch, [{}]);
});

it('replaces a user-supplied --vm-service-port with the capability value', async () => {
  const caps = {dartVmServicePort: 9123, processArguments: {args: ['--vm-service-port=1']}};
  const forwarded = w3cCaps();

  await start(caps, forwarded);

  assert.deepEqual(forwardedArgs[0].alwaysMatch['appium:processArguments'].args, [
    '--vm-service-port=9123',
    '--disable-service-auth-codes',
  ]);
});

it('forwards the W3C caps unchanged when dartVmServicePort is not set', async () => {
  const forwarded = w3cCaps({'appium:app': 'x'});

  await start({}, forwarded);

  assert.deepEqual(forwardedArgs[0], w3cCaps({'appium:app': 'x'}));
});
