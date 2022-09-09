
// tslint:disable:object-literal-sort-keys

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

export const scrollUntilVisible = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    item: string;
    alignment: number;
    dxScroll: number;
    dyScroll: number;
  },
) => {
  const { item, alignment = 0.0, dxScroll = 0, dyScroll = 0 } = opts;

  if (
    typeof alignment !== `number` ||
    typeof dxScroll !== `number` ||
    typeof dyScroll !== `number`
  ) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  if (dxScroll === 0 && dyScroll === 0) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  // Kick off an (unawaited) waitForTappable that will complete when the item we're
  // looking for finally scrolls onscreen and can be hit-tested. We add an initial pause to give it
  // the chance to complete if the item is already onscreen; if not, scroll
  // repeatedly until we either find the item or time out.
  let isVisible = false;
  waitForTappable(self, item).then((_) => {
    isVisible = true;
  });
  while (!isVisible) {
    await scroll(self, elementBase64, {
      dx: dxScroll,
      dy: dyScroll,
      durationMilliseconds: 100,
    });
  }
  return scrollIntoView(self, item, { alignment });
};

export const scrollIntoView = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    alignment: number;
  },
) => {
  const { alignment = 0.0 } = opts;
  if (typeof alignment !== `number`) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`${opts} is not a valid options`);
  }

  return await self.executeElementCommand(`scrollIntoView`, elementBase64, {
    alignment,
  });
};
