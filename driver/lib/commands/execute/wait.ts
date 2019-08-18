import { FlutterDriver } from '../../driver';

export const waitForAbsent = async (
  self: FlutterDriver,
  elementBase64: string,
) => await self.executeElementCommand(`waitForAbsent`, elementBase64);

export const waitFor = async (
  self: FlutterDriver,
  elementBase64: string,
) => await self.executeElementCommand(`waitFor`, elementBase64);
