import assert from 'node:assert/strict';
import {it} from 'node:test';

import {injectDartVmServicePortFlags} from '../build/lib/sessions/ios.js';

const w3cCaps = (alwaysMatch = {}, firstMatch = [{}]) => ({alwaysMatch, firstMatch});

it('mirrors the injected VM service flags into the W3C caps forwarded to XCUITest', () => {
  const caps = {dartVmServicePort: 9123, processArguments: {args: ['--foo'], env: {A: '1'}}};
  const forwarded = w3cCaps({'appium:dartVmServicePort': 9123}, [
    {'appium:processArguments': {args: ['--foo'], env: {A: '1'}}},
  ]);

  injectDartVmServicePortFlags(caps, [forwarded, undefined, {}]);

  const expected = {args: ['--foo', '--vm-service-port=9123', '--disable-service-auth-codes'], env: {A: '1'}};
  assert.deepEqual(caps.processArguments, expected);
  assert.deepEqual(forwarded.alwaysMatch['appium:processArguments'], expected);
  assert.deepEqual(forwarded.firstMatch, [{}]);
});

it('replaces a user-supplied --vm-service-port with the capability value', () => {
  const caps = {dartVmServicePort: 9123, processArguments: {args: ['--vm-service-port=1']}};
  const forwarded = w3cCaps();

  injectDartVmServicePortFlags(caps, [forwarded]);

  assert.deepEqual(forwarded.alwaysMatch['appium:processArguments'].args, [
    '--vm-service-port=9123',
    '--disable-service-auth-codes',
  ]);
});

it('leaves both caps untouched when dartVmServicePort is not set', () => {
  const caps = {};
  const forwarded = w3cCaps({'appium:app': 'x'});

  injectDartVmServicePortFlags(caps, [forwarded]);

  assert.deepEqual(caps, {});
  assert.deepEqual(forwarded, w3cCaps({'appium:app': 'x'}));
});
