import assert from 'node:assert/strict';
import {after, before, beforeEach, it} from 'node:test';

import {Server} from 'rpc-websockets';

import {execute, TEXT_INPUT_ACTIONS} from '../build/lib/commands/execute.js';
import {connectSocket, executeElementCommand} from '../build/lib/sessions/observatory.js';

const EXPECTED_TEXT_INPUT_ACTIONS = [
  'none',
  'unspecified',
  'done',
  'go',
  'search',
  'send',
  'next',
  'previous',
  'continueAction',
  'join',
  'route',
  'emergencyCall',
  'newline',
];

const noopLog = {info() {}, debug() {}, warn() {}, error() {}, errorWithException() {}};

let server;
let url;
let receivedCommands = [];
let nextResponse;
const sockets = [];

before(async () => {
  server = new Server({host: '127.0.0.1', port: 0});
  await new Promise((resolve) => server.on('listening', resolve));
  url = `ws://127.0.0.1:${server.wss.address().port}/ws`;

  server.register('getIsolate', () => ({extensionRPCs: ['ext.flutter.driver']}), '/ws');
  server.register(
    'ext.flutter.driver',
    (params) => {
      receivedCommands.push(params);
      if (nextResponse) {
        const response = nextResponse;
        nextResponse = undefined;
        return response;
      }
      return {isError: false, response: {}};
    },
    '/ws',
  );
});

beforeEach(() => {
  receivedCommands = [];
  nextResponse = undefined;
});

after(async () => {
  for (const socket of sockets) {
    socket.dispose();
  }
  for (const client of server.wss.clients) {
    client.terminate();
  }
  await server.close();
});

async function createConnectedDriver() {
  const driver = {
    log: noopLog,
    executeElementCommand,
  };
  driver.socket = await connectSocket.call(driver, url, {isolateId: 'isolates/1'});
  sockets.push(driver.socket);
  return driver;
}

it('exports the exact Flutter TextInputAction enum values', () => {
  assert.deepEqual(TEXT_INPUT_ACTIONS, EXPECTED_TEXT_INPUT_ACTIONS);
});

it('sends send_text_input_action with the exact payload for every valid TextInputAction', {timeout: 5000}, async () => {
  const driver = await createConnectedDriver();

  for (const action of EXPECTED_TEXT_INPUT_ACTIONS) {
    const result = await execute.call(driver, 'flutter:sendTextInputAction', [action]);
    assert.deepEqual(result, {});
  }

  assert.deepEqual(
    receivedCommands,
    EXPECTED_TEXT_INPUT_ACTIONS.map((action) => ({
      command: 'send_text_input_action',
      action,
      isolateId: 'isolates/1',
    })),
  );
});

it('supports whitespace around the flutter: command prefix', {timeout: 5000}, async () => {
  const driver = await createConnectedDriver();

  const result = await execute.call(driver, ' flutter: sendTextInputAction ', ['search']);

  assert.deepEqual(result, {});
  assert.deepEqual(receivedCommands, [
    {
      command: 'send_text_input_action',
      action: 'search',
      isolateId: 'isolates/1',
    },
  ]);
});

it('rejects missing or invalid actions without sending a Dart VM command', async () => {
  const circular = {};
  circular.self = circular;

  let socketCalled = false;
  const driver = {
    log: noopLog,
    executeElementCommand: async () => {
      socketCalled = true;
      return {};
    },
  };

  const invalidCases = [
    {label: 'missing argument', args: []},
    {label: 'undefined', args: [undefined]},
    {label: 'null', args: [null]},
    {label: 'empty string', args: ['']},
    {label: 'unknown action', args: ['submit']},
    {label: 'uppercase', args: ['DONE']},
    {label: 'title case', args: ['Done']},
    {label: 'padded whitespace', args: [' done ']},
    {label: 'enum prefix', args: ['TextInputAction.done']},
    {label: 'number', args: [123]},
    {label: 'boolean', args: [true]},
    {label: 'object', args: [{action: 'done'}]},
    {label: 'symbol', args: [Symbol('done')]},
    {label: 'bigint', args: [123n]},
    {label: 'circular object', args: [circular]},
    {label: 'Object.prototype toString', args: ['toString']},
    {label: 'Object.prototype constructor', args: ['constructor']},
    {label: 'Object.prototype __proto__', args: ['__proto__']},
  ];

  for (const {label, args} of invalidCases) {
    await assert.rejects(
      execute.call(driver, 'flutter:sendTextInputAction', args),
      /Invalid text input action: .+\. Valid actions are: none, unspecified, done, go, search, send, next, previous, continueAction, join, route, emergencyCall, newline/,
      `expected rejection for ${label}`,
    );
  }

  assert.equal(socketCalled, false);
});

it('propagates Flutter Driver extension errors from the Dart VM', {timeout: 5000}, async () => {
  const driver = await createConnectedDriver();
  nextResponse = {
    isError: true,
    response:
      'Uncaught extension error while executing send_text_input_action: Bad state: Unable to fulfill `FlutterDriver.sendTextInputAction`. Text emulation is disabled.',
  };

  await assert.rejects(
    execute.call(driver, 'flutter:sendTextInputAction', ['done']),
    /Cannot execute command send_text_input_action, server response[\s\S]*Text emulation is disabled/,
  );
});

it('rejects when the Dart VM returns no response', async () => {
  const driver = {
    log: noopLog,
    executeElementCommand,
    socket: {
      executeSocketCommand: async () => undefined,
    },
  };

  await assert.rejects(
    execute.call(driver, 'flutter:sendTextInputAction', ['done']),
    /Cannot execute command send_text_input_action, no response from the Dart VM/,
  );
});
