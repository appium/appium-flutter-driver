import assert from 'node:assert/strict';
import {it, mock} from 'node:test';

import {FlutterDriver} from '../build/lib/driver.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};

// The reconnect that follows the launch fails right away here because no device-log monitor
// was started, which shows that the driver tried to re-attach to the Dart VM.
it('forwards mobile: launchApp to XCUITest from the FLUTTER context and reconnects', async () => {
  const proxydriver = {executeCommand: mock.fn(async () => {})};
  const params = {bundleId: 'com.example.app', arguments: ['--vm-service-port=9123']};

  await assert.rejects(
    FlutterDriver.prototype.executeCommand.call(
      {log: noopLog, currentContext: 'FLUTTER', internalCaps: {platformName: 'iOS'}, proxydriver},
      'execute',
      'mobile: launchApp',
      [params],
    ),
    /mandatory syslog service/,
  );

  assert.deepEqual(proxydriver.executeCommand.mock.calls[0].arguments, ['execute', 'mobile: launchApp', [params]]);
});

it('skips the reconnect for mobile: launchApp when skipAttachObservatoryUrl is set', async () => {
  const proxydriver = {executeCommand: mock.fn(async () => {})};

  await FlutterDriver.prototype.executeCommand.call(
    {log: noopLog, currentContext: 'FLUTTER', internalCaps: {platformName: 'iOS'}, proxydriver},
    'execute',
    'mobile: launchApp',
    [{bundleId: 'com.example.app', skipAttachObservatoryUrl: true}],
  );

  assert.equal(proxydriver.executeCommand.mock.callCount(), 1);
});
