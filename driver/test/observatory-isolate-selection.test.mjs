import assert from 'node:assert/strict';
import {afterEach, beforeEach, it} from 'node:test';

import {Server} from 'rpc-websockets';

import {connectSocket} from '../build/lib/sessions/observatory.js';

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};

let server;
let url;
let socket;
let vmRequests;
let isolateRequests;
let uiAppearsAfterFirstVm;

beforeEach(async () => {
  vmRequests = 0;
  isolateRequests = [];
  uiAppearsAfterFirstVm = false;
  server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  url = `ws://127.0.0.1:${server.wss.address().port}/ws`;

  server.register(
    'getVM',
    () => {
      vmRequests++;
      const isolates = [{id: 'isolates/background', name: 'main'}];
      if (!uiAppearsAfterFirstVm || vmRequests > 1) {
        isolates.push({id: 'isolates/ui', name: 'main'});
      }
      return {isolates};
    },
    '/ws',
  );
  server.register(
    'getIsolate',
    ({isolateId}) => {
      isolateRequests.push(isolateId);
      return {
        extensionRPCs: isolateId === 'isolates/ui' || isolateId === 'isolates/explicit' ? ['ext.flutter.driver'] : [],
      };
    },
    '/ws',
  );
});

afterEach(async () => {
  if (socket) {
    socket.reconnect = false;
    socket.close();
    socket = undefined;
  }
  for (const client of server.wss.clients) {
    client.terminate();
  }
  await server.close();
});

it('selects the main isolate that exposes ext.flutter.driver when multiple isolates are named main', async () => {
  socket = await connectSocket.call({log: noopLog}, url, {});

  assert.equal(socket.isolateId, 'isolates/ui');
  assert.equal(vmRequests, 1);
  assert.deepEqual(isolateRequests, ['isolates/background', 'isolates/ui']);
});

it('refreshes automatic isolate discovery until the UI isolate appears', async () => {
  uiAppearsAfterFirstVm = true;
  socket = await connectSocket.call({log: noopLog}, url, {});

  assert.equal(socket.isolateId, 'isolates/ui');
  assert.equal(vmRequests, 2);
  assert.deepEqual(isolateRequests, ['isolates/background', 'isolates/background', 'isolates/ui']);
});

it('checks only the explicitly configured isolate', async () => {
  socket = await connectSocket.call({log: noopLog}, url, {isolateId: 'isolates/explicit'});

  assert.equal(socket.isolateId, 'isolates/explicit');
  assert.equal(vmRequests, 0);
  assert.deepEqual(isolateRequests, ['isolates/explicit']);
});
