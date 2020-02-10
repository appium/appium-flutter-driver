import { FlutterDriver } from '../../driver';

const waitForConstructor = (command: `waitForAbsent` | `waitFor`) => async (
  self: FlutterDriver,
  elementBase64: string,
  durationMilliseconds?: number,
) => {

  let args = {};

  if (typeof durationMilliseconds === `number`) {
    args = {
      timeout: durationMilliseconds * 1000,
    };
  } else if (typeof durationMilliseconds !== `undefined`) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`durationMilliseconds is not a valid options`);
  }

  await self.executeElementCommand(command, elementBase64, args);
};

export const waitForAbsent = waitForConstructor(`waitForAbsent`);

export const waitFor = waitForConstructor(`waitFor`);
