import { FlutterDriver } from '../driver';

export const click = async function(this: FlutterDriver, el: string) {
  const retVal = await this.tapEl(el, false);
  return retVal;
};

export const tapEl = async function(
  this: FlutterDriver,
  el: string,
  longPress: boolean,
) {
  // perform a tap on the given element
  // if longPress is true, the tap becomes a longPress action
  const commandName = longPress ? `longPress` : `tap`;
  return await this.executeElementCommand(commandName, el);
};

export const tap = async function(
  this: FlutterDriver,
  gestures,
  longPress: boolean,
) {
  // parse the given gestures array to call the appropriate tap method
  // if longPress is true, the tap is a long press action
  const elementId = gestures[0].options.element;
  await this.tapEl(elementId, longPress);
};

export const performTouch = async function(this: FlutterDriver, gestures) {
  if (gestures.length === 2) {
    if (gestures[0].action === `press` && gestures[1].action === `release`) {
      return await this.tap(gestures, false);
    } else if (
      gestures[0].action === `longPress` &&
      gestures[1].action === `release`
    ) {
      return await this.tap(gestures, true);
    }
  } else if (gestures.length === 1) {
    if (gestures[0].action === `tap`) {
      return await this.tap(gestures, false);
    }
  }
};
