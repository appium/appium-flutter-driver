import assert from 'node:assert/strict';
import {afterEach, it, mock} from 'node:test';

import {XCUITestDriver} from 'appium-xcuitest-driver';

import {FlutterDriver} from '../build/lib/driver.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};

afterEach(() => mock.restoreAll());

// XCUITestDriver defines its commands as instance fields, so the stub goes on the instance.
// The reconnect that follows the relaunch fails right away here because no device-log monitor
// was started, so only what activateApp hands to XCUITest is exercised.
async function activateApp(internalCaps) {
  const proxydriver = new XCUITestDriver({});
  const mobileLaunchApp = mock.method(proxydriver, 'mobileLaunchApp', async () => {});
  await assert.rejects(
    FlutterDriver.prototype.activateApp.call({log: noopLog, internalCaps, proxydriver}, 'com.example.app'),
    /mandatory syslog service/,
  );
  assert.equal(mobileLaunchApp.mock.callCount(), 1);
  return mobileLaunchApp.mock.calls[0].arguments;
}

it('relaunches the iOS app with the session processArguments', async () => {
  const launchArgs = await activateApp({
    platformName: 'iOS',
    processArguments: {args: ['--vm-service-port=9123', '--disable-service-auth-codes'], env: {A: '1'}},
  });

  assert.deepEqual(launchArgs, [
    'com.example.app',
    ['--vm-service-port=9123', '--disable-service-auth-codes'],
    {A: '1'},
  ]);
});

it('relaunches the iOS app without arguments when processArguments is not set', async () => {
  const launchArgs = await activateApp({platformName: 'iOS'});

  assert.deepEqual(launchArgs, ['com.example.app', undefined, undefined]);
});
