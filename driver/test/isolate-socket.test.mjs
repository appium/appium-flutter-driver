import assert from 'node:assert/strict';
import {after, before, it} from 'node:test';

import {Server} from 'rpc-websockets';

import {IsolateSocket} from '../build/lib/sessions/isolate_socket.js';
import {connectSocket, executeElementCommand} from '../build/lib/sessions/observatory.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};
const sockets = [];
let server;
let url;

// A fake Dart VM service that drops the connection while a Flutter Driver command is pending,
// like an app that crashes or relaunches in the middle of `waitForAbsent`.
before(async () => {
  server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  url = `ws://127.0.0.1:${server.wss.address().port}/ws`;
  server.register('getIsolate', () => ({extensionRPCs: ['ext.flutter.driver']}), '/ws');
  server.register(
    'ext.flutter.driver',
    () => {
      for (const client of server.wss.clients) {
        client.terminate();
      }
      return new Promise(() => {});
    },
    '/ws',
  );
});

after(async () => {
  for (const socket of sockets) {
    socket.reconnect = false;
    socket.close();
  }
  await server.close();
});

it('rejects a pending command when the Dart VM connection closes', {timeout: 5000}, async () => {
  const socket = new IsolateSocket(url);
  sockets.push(socket);
  await new Promise((resolve) => socket.once('open', resolve));

  await assert.rejects(socket.executeSocketCommand({command: 'waitForAbsent'}), /connection was closed/);
});

it('fails an element command instead of hanging when the Dart VM connection closes', {timeout: 5000}, async () => {
  const logged = [];
  const driver = {log: {...noopLog, errorWithException: (err) => logged.push(err.message)}};
  driver.socket = await connectSocket.call(driver, url, {isolateId: 'isolates/1'});
  sockets.push(driver.socket);
  const finder = Buffer.from(
    JSON.stringify({finderType: 'ByValueKey', keyValueString: 'my_key', keyValueType: 'String'}),
  ).toString('base64url');

  await assert.rejects(
    executeElementCommand.call(driver, 'waitForAbsent', finder),
    /Cannot execute command waitForAbsent, no response from the Dart VM/,
  );
  assert.deepEqual(logged, ['The Dart VM connection was closed before it replied']);
});
