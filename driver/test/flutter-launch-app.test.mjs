import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {it} from 'node:test';

import {INSTRUMENT_CHANNEL, services} from 'appium-ios-device';
import {Server} from 'rpc-websockets';

import {execute} from '../build/lib/commands/execute.js';
import {LogMonitor} from '../build/lib/sessions/log-monitor.js';
import {extractObservatoryUrl} from '../build/lib/sessions/observatory.js';

it('flutter:launchApp retains the VM service URL emitted during the Instruments launch', {timeout: 5000}, async (t) => {
  const server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  const {port} = server.wss.address();
  server.register('getVM', () => ({isolates: [{name: 'main', id: 'isolates/1'}]}), '/ws');
  server.register('getIsolate', () => ({extensionRPCs: ['ext.flutter.driver']}), '/ws');

  const emitter = new EventEmitter();
  const logmon = new LogMonitor(emitter, async (entry) => Boolean(extractObservatoryUrl(entry))).start();
  const emitUrl = (url) =>
    emitter.emit('output', {
      timestamp: Date.now(),
      level: 'I',
      message: `flutter: The Dart VM service is listening on ${url}`,
    });
  const driver = {
    log: {info() {}, debug() {}, warn() {}, error() {}},
    internalCaps: {platformName: 'iOS', udid: 'test-udid', maxRetryCount: 1, retryBackoffTime: 1},
    proxydriver: {isRealDevice: () => false},
    _logmon: logmon,
  };
  const args = ['--verbose-logging'];
  const env = {TEST_MODE: 'true'};
  const callChannel = t.mock.fn(async () => {
    assert.equal(logmon.lastMatch, null, 'clear the old URL before starting the app');
    emitUrl(`http://127.0.0.1:${port}/`);
    await new Promise((resolve) => setImmediate(resolve));
  });
  const close = t.mock.fn();
  const startInstrumentService = t.mock.method(services, 'startInstrumentService', async () => ({callChannel, close}));

  try {
    emitUrl('http://127.0.0.1:1/old=/');
    await new Promise((resolve) => setImmediate(resolve));

    await execute.call(driver, 'flutter:launchApp', ['com.example.app', {arguments: args, environment: env}]);

    assert.deepEqual(startInstrumentService.mock.calls[0].arguments, ['test-udid']);
    assert.deepEqual(callChannel.mock.calls[0].arguments, [
      INSTRUMENT_CHANNEL.PROCESS_CONTROL,
      'launchSuspendedProcessWithDevicePath:bundleIdentifier:environment:arguments:options:',
      '',
      'com.example.app',
      env,
      args,
      {StartSuspendedKey: 0, KillExisting: 1},
    ]);
    assert.equal(close.mock.callCount(), 1);
    assert.equal(driver.connectedVmServiceUrl, `ws://127.0.0.1:${port}/ws`);
    assert.equal(driver.socket.isolateId, 'isolates/1');
  } finally {
    logmon.stop();
    driver.socket?.close();
    await server.close();
  }
});
