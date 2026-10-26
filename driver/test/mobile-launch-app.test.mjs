import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {it, mock} from 'node:test';

import {Server} from 'rpc-websockets';

import {FlutterDriver} from '../build/lib/driver.js';
import {LogMonitor} from '../build/lib/sessions/log-monitor.js';
import {extractObservatoryUrl} from '../build/lib/sessions/observatory.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};

// Records the order of proxy calls and newCommandTimeout changes.
function fakeDriver() {
  const events = [];
  return {
    events,
    log: noopLog,
    currentContext: 'FLUTTER',
    internalCaps: {platformName: 'iOS'},
    proxydriver: {
      executeCommand: mock.fn(async () => events.push('proxy')),
      activateApp: mock.fn(async () => events.push('activateApp')),
      isRealDevice: () => false,
    },
    clearNewCommandTimeout: async () => events.push('clearTimeout'),
    startNewCommandTimeout: async () => events.push('startTimeout'),
    reconnectAfterAppLaunch: FlutterDriver.prototype.reconnectAfterAppLaunch,
  };
}

function createLogMonitor(emitter = new EventEmitter()) {
  const logmon = new LogMonitor(emitter, async (entry) => Boolean(extractObservatoryUrl(entry)));
  logmon.start();
  return {emitter, logmon};
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

it('pauses newCommandTimeout during activateApp and reuses the active observatory URL when resuming from background', async () => {
  const server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  const {port} = server.wss.address();
  server.register('getVM', () => ({isolates: [{name: 'main', id: 'isolates/1'}]}), '/ws');
  server.register('getIsolate', () => ({extensionRPCs: ['ext.flutter.driver']}), '/ws');

  const driver = fakeDriver();
  const {emitter, logmon} = createLogMonitor();
  driver._logmon = logmon;
  emitter.emit('output', {
    timestamp: Date.now(),
    level: 'I',
    message: `flutter: The Dart VM service is listening on http://127.0.0.1:${port}/`,
  });
  await new Promise((resolve) => setImmediate(resolve));

  try {
    await FlutterDriver.prototype.activateApp.call(driver, 'com.example.app');
    assert.equal(driver.connectedVmServiceUrl, `ws://127.0.0.1:${port}/ws`);
    assert.equal(driver.socket.isolateId, 'isolates/1');
    assert.deepEqual(driver.events, ['clearTimeout', 'activateApp', 'startTimeout']);
  } finally {
    driver.socket?.close();
    await server.close();
  }
});

it('falls back to waiting for a new observatory log when the previous URL is dead on activateApp', async () => {
  const driver = fakeDriver();
  driver.internalCaps = {platformName: 'iOS', maxRetryCount: 2, retryBackoffTime: 10};
  const {emitter, logmon} = createLogMonitor();
  driver._logmon = logmon;
  emitter.emit('output', {
    timestamp: Date.now(),
    level: 'I',
    message: 'flutter: The Dart VM service is listening on http://127.0.0.1:1/dead=/',
  });
  await new Promise((resolve) => setImmediate(resolve));

  setTimeout(() => {
    emitter.emit('output', {
      timestamp: Date.now(),
      level: 'I',
      message: 'flutter: The Dart VM service is listening on http://127.0.0.1:2/fresh=/',
    });
  }, 5);

  await assert.rejects(
    FlutterDriver.prototype.activateApp.call(driver, 'com.example.app'),
    /Cannot connect to the Dart Observatory URL ws:\/\/127\.0\.0\.1:2\/fresh=\/ws/,
  );

  assert.equal(driver.connectedVmServiceUrl, 'ws://127.0.0.1:2/fresh=/ws');
});

it('captures a new observatory URL emitted while mobile: launchApp is executing', async () => {
  const driver = fakeDriver();
  const {emitter, logmon} = createLogMonitor();
  driver._logmon = logmon;
  emitter.emit('output', {
    timestamp: Date.now(),
    level: 'I',
    message: 'flutter: The Dart VM service is listening on http://127.0.0.1:1/old=/',
  });
  await new Promise((resolve) => setImmediate(resolve));

  driver.proxydriver.executeCommand = mock.fn(async () => {
    driver.events.push('proxy');
    emitter.emit('output', {
      timestamp: Date.now(),
      level: 'I',
      message: 'flutter: The Dart VM service is listening on http://127.0.0.1:2/new=/',
    });
    await new Promise((resolve) => setImmediate(resolve));
  });

  await assert.rejects(
    FlutterDriver.prototype.executeCommand.call(driver, 'execute', 'mobile: launchApp', [
      {bundleId: 'com.example.app'},
    ]),
    /Cannot connect to the Dart Observatory URL ws:\/\/127\.0\.0\.1:2\/new=\/ws/,
  );

  assert.equal(driver.connectedVmServiceUrl, 'ws://127.0.0.1:2/new=/ws');
});
