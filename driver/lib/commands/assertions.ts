import { FlutterDriver } from '../driver';
import { waitFor, waitForAbsent, waitForTappable } from './execute/wait';
import { byValueKey, byText, byTooltip } from 'appium-flutter-finder';
import type { SerializableFinder } from 'appium-flutter-finder';

const serializeFinder = (finder: SerializableFinder): string => {
  return Buffer.from(JSON.stringify(finder)).toString('base64');
};

type FinderInput =
  | { key: string }
  | { text: string }
  | { label: string };

function getFinderBase64(input: FinderInput): string {
  if ('key' in input) {
    return serializeFinder(byValueKey(input.key));
  }
  if ('text' in input) {
    return serializeFinder(byText(input.text));
  }
  if ('label' in input) {
    return serializeFinder(byTooltip(input.label));
  }
  throw new Error('Invalid finder input: must provide key, text, or label');
}
/**
 * Asserts that an element is visible within a timeout.
 */
export const assertVisible = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> => {
  try {
    const base64 = getFinderBase64(input);
    await waitFor(driver, base64, timeout);
  } catch {
    throw new Error(`Assertion failed: Element was not visible within ${timeout}ms`);
  }
};

/**
 * Asserts that an element is NOT visible (i.e., removed from widget tree).
 */
export const assertNotVisible = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> => {
  try {
    const base64 = getFinderBase64(input);
    await waitForAbsent(driver, base64, timeout);
  } catch {
    throw new Error(`Assertion failed: Element was still visible after ${timeout}ms`);
  }
};

/**
 * Asserts that an element is tappable.
 */
export const assertTappable = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> => {
  try {
    const base64 = getFinderBase64(input);
    await waitForTappable(driver, base64, timeout);
  } catch {
    throw new Error(`Assertion failed: Element was not tappable within ${timeout}ms`);
  }
};

/**
 * Asserts that a specific text is present.
 */
export const assertTextPresent = async (
  driver: FlutterDriver,
  input: FinderInput,
  timeout = 5000
): Promise<void> => {
  try {
    const base64 = getFinderBase64(input);
    await waitFor(driver, base64, timeout);
  } catch {
    throw new Error(`Assertion failed: Text was not found within ${timeout}ms`);
  }
};
