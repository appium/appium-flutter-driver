
import _ from 'lodash';
import { FlutterDriver } from '../../driver';
import { waitFor, waitForTappable } from './wait';

export const scroll = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    dx: number;
    dy: number;
    durationMilliseconds: number;
    frequency?: number;
  },
) => {
  const { dx, dy, durationMilliseconds, frequency = 60 } = opts;

  if (
    typeof dx !== `number` ||
    typeof dy !== `number` ||
    typeof durationMilliseconds !== `number` ||
    typeof frequency !== `number`
  ) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  if (dx === 0 && dy === 0) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  return await self.executeElementCommand(`scroll`, elementBase64, {
    dx,
    dy,
    // 'scroll' expects microseconds
    // https://github.com/flutter/flutter/blob/master/packages/flutter_driver/lib/src/common/gesture.dart#L33-L38
    duration: durationMilliseconds * 1000,
    frequency,
  });
};

export const longTap = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    durationMilliseconds: number;
    frequency?: number;
  },
) => {
  const { durationMilliseconds, frequency = 60 } = opts;

  if (
    typeof durationMilliseconds !== `number` ||
    typeof frequency !== `number`
  ) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  return await self.executeElementCommand(`scroll`, elementBase64, {
    dx: 0,
    dy: 0,
    // 'scroll' expects microseconds
    // https://github.com/flutter/flutter/blob/master/packages/flutter_driver/lib/src/common/gesture.dart#L33-L38
    duration: durationMilliseconds * 1000,
    frequency,
  });
};

const validateOps = (alignment: any, dxScroll: any, dyScroll: any): boolean => {
  if (
    typeof alignment !== `number` ||
    typeof dxScroll !== `number` ||
    typeof dyScroll !== `number`
  ) {
    return false;
  }

  if (dxScroll === 0 && dyScroll === 0) {
    return false;
  }

  return true;
};

const shouldRetry = (startAt: number, waitTimeoutMilliseconds?: number): boolean => {
  if (!waitTimeoutMilliseconds) {
    // Then, the scroll should continue infinitely
    return true;
  }

  return Date.now() - startAt < _.toInteger(waitTimeoutMilliseconds);
};

export const scrollUntilVisible = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    item: string;
    alignment: number;
    dxScroll: number;
    dyScroll: number;
    durationMilliseconds: number;
    frequency?: number;
    waitTimeoutMilliseconds?: number;
  },
) => {
  const { item, alignment = 0.0, dxScroll = 0, dyScroll = 0, durationMilliseconds = 100, frequency, waitTimeoutMilliseconds } = opts;

  if (!validateOps(alignment, dxScroll, dyScroll)) {
    throw new Error(`${opts} is not a valid options`);
  }

  // An expectation for checking that an element, known to be present on the widget tree, is visible
  let isVisible = false;
  (async () => {
    try {
      await waitFor(self, item, waitTimeoutMilliseconds);
      isVisible = true;
    } catch (ign) {}
  })();
  const startAt = Date.now();
  while (!isVisible && shouldRetry(startAt, waitTimeoutMilliseconds)) {
    try {
      await scroll(self, elementBase64, {
        dx: dxScroll,
        dy: dyScroll,
        durationMilliseconds,
        frequency
      });
    } catch { /* go to the next scroll */ }
  }

  if (!isVisible) {
    throw new Error(`Stop scrolling as timeout ${waitTimeoutMilliseconds}`);
  }

  return scrollIntoView(self, item, { alignment });
};

export const scrollUntilTapable = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    item: string;
    alignment: number;
    dxScroll: number;
    dyScroll: number;
    durationMilliseconds: number;
    frequency?: number;
    waitTimeoutMilliseconds?: number;
  },
) => {
  const { item, alignment = 0.0, dxScroll = 0, dyScroll = 0, durationMilliseconds = 100, frequency, waitTimeoutMilliseconds } = opts;

  if (!validateOps(alignment, dxScroll, dyScroll)) {
    throw new Error(`${opts} is not a valid options`);
  }

  // Kick off an (unawaited) waitForTappable that will complete when the item we're
  // looking for finally scrolls onscreen and can be hit-tested. We add an initial pause to give it
  // the chance to complete if the item is already onscreen; if not, scroll
  // repeatedly until we either find the item or time out.
  let isVisible = false;
  (async () => {
    try {
      await waitForTappable(self, item, waitTimeoutMilliseconds);
      isVisible = true;
    } catch (ign) {}
  })();
  const startAt = Date.now();
  while (!isVisible && shouldRetry(startAt, waitTimeoutMilliseconds)) {
    try {
      await scroll(self, elementBase64, {
        dx: dxScroll,
        dy: dyScroll,
        durationMilliseconds,
        frequency
      });
    } catch { /* go to the next scroll */ }
  }

  if (!isVisible) {
    throw new Error(`Stop scrolling as timeout ${waitTimeoutMilliseconds}`);
  }

  return scrollIntoView(self, item, { alignment });
};

export const scrollIntoView = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    alignment: number;
    timeout?: number;
  },
) => {
  const { alignment = 0.0, timeout } = opts;
  if (typeof alignment !== `number` || (typeof timeout !== `undefined` && typeof timeout !== `number`)) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  const args = typeof timeout === `number` ? { alignment, timeout } : { alignment };

  return await self.executeElementCommand(`scrollIntoView`, elementBase64, args);
};
