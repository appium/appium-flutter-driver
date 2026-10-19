import assert from 'node:assert/strict';
import {it, mock} from 'node:test';

import {FlutterDriver} from '../build/lib/driver.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};

// Records the order of proxy calls and newCommandTimeout changes.
function fakeDriver() {
  const events = [];
  return {
    events,
    log: noopLog,
    currentContext: 'FLUTTER',
    internalCaps: {platformName: 'iOS'},
    proxydriver: {executeCommand: mock.fn(async () => events.push('proxy'))},
    clearNewCommandTimeout: async () => events.push('clearTimeout'),
    startNewCommandTimeout: async () => events.push('startTimeout'),
  };
}

// The reconnect that follows the launch fails right away here because no device-log monitor
// was started, which shows that the driver tried to re-attach to the Dart VM.
it('forwards mobile: launchApp to XCUITest from the FLUTTER context and reconnects', async () => {
  const driver = fakeDriver();
  const params = {bundleId: 'com.example.app', arguments: ['--vm-service-port=9123']};

  await assert.rejects(
    FlutterDriver.prototype.executeCommand.call(driver, 'execute', 'mobile: launchApp', [params]),
    /mandatory syslog service/,
  );

  assert.deepEqual(driver.proxydriver.executeCommand.mock.calls[0].arguments, [
    'execute',
    'mobile: launchApp',
    [params],
  ]);
});

it('skips the reconnect for mobile: launchApp when skipAttachObservatoryUrl is set', async () => {
  const driver = fakeDriver();

  await FlutterDriver.prototype.executeCommand.call(driver, 'execute', 'mobile: launchApp', [
    {bundleId: 'com.example.app', skipAttachObservatoryUrl: true},
  ]);

  assert.equal(driver.proxydriver.executeCommand.mock.callCount(), 1);
});

// The reconnect can wait for the observatory URL far longer than newCommandTimeout, so the
// timeout must be paused for the whole command and restarted even when the reconnect fails.
it('pauses newCommandTimeout while launching and reconnecting', async () => {
  const driver = fakeDriver();

  await assert.rejects(
    FlutterDriver.prototype.executeCommand.call(driver, 'execute', 'mobile: activateApp', [
      {bundleId: 'com.example.app'},
    ]),
    /mandatory syslog service/,
  );

  assert.deepEqual(driver.events, ['clearTimeout', 'proxy', 'startTimeout']);
});
