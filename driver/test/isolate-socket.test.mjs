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

// A fake Dart VM service that drops the connection while a Flutter Driver command is pending,
// like an app that crashes or relaunches in the middle of `waitForAbsent`.
before(async () => {
  server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  url = `ws://127.0.0.1:${server.wss.address().port}/ws`;
  server.register('getIsolate', () => ({extensionRPCs: ['ext.flutter.driver']}), '/ws');
  // Drop the caller's connection during the initial VM lookup. By default rpc-websockets would
  // reconnect the dropped socket after 1 s.
  server.register(
    'getVM',
    (_params, socketId) => {
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
    socket.dispose();
  }
  // Drop any connection that is still open so that closing the server cannot hang.
  for (const client of server.wss.clients) {
    client.terminate();
  }
  await server.close();
});

// Keep this test first: it counts the connections to the server, and the sockets of later tests
// reconnect to this server.
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
  // The abandoned socket must not reconnect. Wait longer than the rpc-websockets reconnect
  // interval (1 s) and check that the server sees no new connection.
  let reconnects = 0;
  const onConnection = () => reconnects++;
  server.on('connection', onConnection);
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } finally {
    server.off('connection', onConnection);
  }
  assert.equal(reconnects, 0);
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
