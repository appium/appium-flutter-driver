import { FlutterDriver } from '../../driver';

export const waitForAbsent = async (
  self: FlutterDriver,
  elementBase64: string,
  durationMilliseconds?: number,
) => {

  if (typeof durationMilliseconds === `undefined`) {
    durationMilliseconds = 10;
  }

  if (typeof durationMilliseconds !== `number`) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`durationMilliseconds is not a valid options`);
  }

  await self.executeElementCommand(`waitForAbsent`, elementBase64, {
    timeout: durationMilliseconds * 1000,
  });
};

export const waitFor = async (
  self: FlutterDriver,
  elementBase64: string,
  durationMilliseconds?: number,
) => {
  if (typeof durationMilliseconds === `undefined`) {
    durationMilliseconds = 10;
  }

  if (typeof durationMilliseconds !== `number`) {
    // @todo BaseDriver's errors.InvalidArgumentError();
    throw new Error(`durationMilliseconds is not a valid options`);
  }

  await self.executeElementCommand(`waitFor`, elementBase64, {
    timeout: durationMilliseconds * 1000,
  });
};
