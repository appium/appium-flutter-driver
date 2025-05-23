import { FlutterDriver } from '../driver';
import { byValueKey, byText, byTooltip } from 'appium-flutter-finder';
import type { SerializableFinder } from 'appium-flutter-finder';

export type FinderInput =
  | { key: string }
  | { text: string }
  | { label: string }
  | SerializableFinder
  | string
  | { getRawFinder: () => SerializableFinder }; // FlutterElement-like input

// Serialize a finder to base64
const serializeFinder = (finder: SerializableFinder): string =>
  Buffer.from(JSON.stringify(finder)).toString('base64');

// Type guards
const isRawFinder = (input: any): input is SerializableFinder =>
  input && typeof input === 'object' && typeof input.finderType === 'string';

const isFlutterElementLike = (input: any): input is { getRawFinder: () => SerializableFinder } =>
  input && typeof input === 'object' && typeof input.getRawFinder === 'function';

// Convert FinderInput to base64 string
function getFinderBase64(input: FinderInput): string {
  if (typeof input === 'string') {
    return input; // already base64
  }

  if (isFlutterElementLike(input)) {
    return serializeFinder(input.getRawFinder());
  }

  if (isRawFinder(input)) {
    return serializeFinder(input);
  }

  if ('key' in input) {
    return serializeFinder(byValueKey(input.key));
  }

  if ('text' in input) {
    return serializeFinder(byText(input.text));
  }

  if ('label' in input) {
    return serializeFinder(byTooltip(input.label));
  }

  throw new Error('Invalid finder input: must provide key, text, label, raw finder, or FlutterElement');
}

// Generic helper to wrap assert commands
async function executeAssertion(
  driver: FlutterDriver,
  command: string,
  input: FinderInput,
  timeout = 5000,
  extraArgs: object = {}
): Promise<void> {
  const base64 = getFinderBase64(input);
  try {
    await driver.executeElementCommand(command, base64, { timeout, ...extraArgs });
  } catch (err) {
    throw new Error(`Assertion failed on command "${command}" within ${timeout}ms\n${err}`);
  }
}

// Exported assertion commands
export const assertVisible = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> =>
  await executeAssertion(driver, 'waitFor', input, timeout, { visible: true });

export const assertNotVisible = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> =>
  await executeAssertion(driver, 'waitForAbsent', input, timeout);

export const assertTappable = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> =>
  await executeAssertion(driver, 'waitForTappable', input, timeout);

