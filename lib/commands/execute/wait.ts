import { FlutterDriver } from '../../driver';

const waitForConstructor = (command: `waitForAbsent` | `waitFor` | `waitForTappable`) => async (
  self: FlutterDriver,
  elementBase64: string,
  durationMilliseconds?: number,
): Promise<string> => {

  let args = {};

  if (typeof durationMilliseconds === `number`) {
    args = {
      timeout: durationMilliseconds,
    };
  } else if (typeof durationMilliseconds !== `undefined`) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`durationMilliseconds is not a valid options`);
  }

  await self.executeElementCommand(command, elementBase64, args);
  return elementBase64;
};

export const waitForAbsent = waitForConstructor(`waitForAbsent`);

export const waitFor = waitForConstructor(`waitFor`);

export const waitForTappable = waitForConstructor(`waitForTappable`);
