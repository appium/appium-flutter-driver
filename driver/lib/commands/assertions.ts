import {util} from '@appium/support';
import {byValueKey, byText, byTooltip, type SerializableFinder} from 'appium-flutter-finder';

import type {FlutterDriver} from '../driver.js';

export type FinderInput =
  | {key: string}
  | {text: string}
  | {label: string}
  | SerializableFinder
  | string
  | {getRawFinder: () => SerializableFinder} // FlutterElement-like input
  | {[util.W3C_WEB_ELEMENT_IDENTIFIER]: string}
  | {ELEMENT: string};

// Serialize a finder to base64
const serializeFinder = (finder: SerializableFinder): string => Buffer.from(JSON.stringify(finder)).toString('base64');

// Type guards
const isRawFinder = (input: any): input is SerializableFinder =>
  input && typeof input === 'object' && typeof input.finderType === 'string';

const isFlutterElementLike = (input: any): input is {getRawFinder: () => SerializableFinder} =>
  input && typeof input === 'object' && typeof input.getRawFinder === 'function';

const isWebElementObject = (input: any): input is {[util.W3C_WEB_ELEMENT_IDENTIFIER]: string} | {ELEMENT: string} =>
  Boolean(
    input &&
    typeof input === 'object' &&
    (typeof input[util.W3C_WEB_ELEMENT_IDENTIFIER] === 'string' || typeof input.ELEMENT === 'string'),
  );

// Convert FinderInput to base64 string
function getFinderBase64(input: FinderInput): string {
  if (typeof input === 'string') {
    return input; // already base64
  }

  if (!input || typeof input !== 'object') {
    throw new Error('Invalid finder input: must provide key, text, label, raw finder, or FlutterElement');
  }

  if (isFlutterElementLike(input)) {
    return serializeFinder(input.getRawFinder());
  }

  if (isWebElementObject(input)) {
    return (
      (input as {[util.W3C_WEB_ELEMENT_IDENTIFIER]?: string})[util.W3C_WEB_ELEMENT_IDENTIFIER] ??
      (input as {ELEMENT: string}).ELEMENT
    );
  }

  if (isRawFinder(input)) {
    return serializeFinder(input);
  }

  if ('key' in input) {
    return byValueKey(input.key);
  }

  if ('text' in input) {
    return byText(input.text);
  }

  if ('label' in input) {
    return byTooltip(input.label);
  }

  throw new Error('Invalid finder input: must provide key, text, label, raw finder, or FlutterElement');
}

// Generic helper to wrap assert commands
async function executeAssertion(
  driver: FlutterDriver,
  command: string,
  input: FinderInput,
  timeout = 5000,
  extraArgs: object = {},
): Promise<void> {
  const base64 = getFinderBase64(input);
  try {
    await driver.executeElementCommand(command, base64, {
      timeout,
      ...extraArgs,
    });
  } catch (err) {
    throw new Error(`Assertion failed on command "${command}" within ${timeout}ms\n${err}`, {
      cause: err,
    });
  }
}

// Generic helper to check element state and return boolean without throwing on timeout/not-found
async function checkCondition(
  driver: FlutterDriver,
  command: string,
  input: FinderInput,
  timeout = 5000,
  extraArgs: object = {},
): Promise<boolean> {
  const base64 = getFinderBase64(input);
  try {
    await driver.executeElementCommand(command, base64, {
      timeout,
      ...extraArgs,
    });
    return true;
  } catch {
    return false;
  }
}

// Exported assertion commands
export const assertVisible = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<void> =>
  await executeAssertion(driver, 'waitFor', input, timeout, {visible: true});

export const assertNotVisible = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<void> =>
  await executeAssertion(driver, 'waitForAbsent', input, timeout);

export const assertTappable = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<void> =>
  await executeAssertion(driver, 'waitForTappable', input, timeout);

// Exported boolean check commands
export const isVisible = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<boolean> =>
  await checkCondition(driver, 'waitFor', input, timeout, {visible: true});

export const isNotVisible = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<boolean> =>
  await checkCondition(driver, 'waitForAbsent', input, timeout);

export const isAbsent = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<boolean> =>
  await isNotVisible(driver, input, timeout);

export const isTappable = async (driver: FlutterDriver, input: FinderInput, timeout = 5000): Promise<boolean> =>
  await checkCondition(driver, 'waitForTappable', input, timeout);
