import assert from 'node:assert/strict';
import {after, before, it} from 'node:test';

import {Server} from 'rpc-websockets';

import {execute} from '../build/lib/commands/execute.js';
import {IsolateSocket} from '../build/lib/sessions/isolate_socket.js';
import {connectSocket, executeElementCommand} from '../build/lib/sessions/observatory.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};
const sockets = [];
let server;
let url;
let reconnected;

// A fake Dart VM service that drops the connection while a Flutter Driver command is pending,
// like an app that crashes or relaunches in the middle of `waitForAbsent`.
before(async () => {
  server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  url = `ws://127.0.0.1:${server.wss.address().port}/ws`;
  server.register('getIsolate', () => ({extensionRPCs: ['ext.flutter.driver']}), '/ws');
  // Drop the caller's connection during the initial VM lookup. rpc-websockets reconnects the
  // dropped socket after 1 s; `reconnected` resolves with the server side of that connection.
  server.register(
    'getVM',
    (_params, socketId) => {
      reconnected = new Promise((resolve) => server.once('connection', resolve));
      server.namespaces['/ws'].clients.get(socketId).terminate();
      return new Promise(() => {});
    },
    '/ws',
  );
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

// Keep this test first: it waits for the reconnect of its own socket, and the sockets of later
// tests would also reconnect to this server.
it('fails to connect instead of hanging when the Dart VM connection closes during getVM', {timeout: 5000}, async () => {
  const unhandled = [];
  const onUnhandled = (reason) => unhandled.push(reason);
  process.on('unhandledRejection', onUnhandled);
  const errors = [];
  const driver = {log: {...noopLog, error: (message) => errors.push(message)}};
  try {
    await assert.rejects(connectSocket.call(driver, url, {}), /Cannot connect to the Dart Observatory URL/);
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
  assert.deepEqual(unhandled, []);
  assert.match(errors.join('\n'), /Cannot set up the connection to .+: The Dart VM connection was closed/);
  // connectSocket no longer listens to the dropped socket. Close its reconnect with a normal
  // closure (code 1000) so rpc-websockets stops reconnecting it.
  (await reconnected).close(1000);
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
    /The Dart VM connection was closed before it replied/,
  );
  assert.deepEqual(logged, []);
});

it('fails a command that calls the socket directly when the Dart VM connection closes', {timeout: 5000}, async () => {
  const logged = [];
  const driver = {log: {...noopLog, errorWithException: (err) => logged.push(err.message)}};
  driver.socket = await connectSocket.call(driver, url, {isolateId: 'isolates/1'});
  sockets.push(driver.socket);

  // enterText returns the socket result as is, without the checks of executeElementCommand.
  await assert.rejects(
    execute.call(driver, 'flutter:enterText', ['hello']),
    /The Dart VM connection was closed before it replied/,
  );
  // A command sent after the drop fails too, instead of resolving with undefined.
  await assert.rejects(execute.call(driver, 'flutter:enterText', ['hello']), /The Dart VM connection is closed/);
  assert.deepEqual(logged, []);
});
