import { FlutterDriver } from '../driver';
import _ from 'lodash';

import { DRIVER_NAME as ANDROID_DEVICE_NAME, startAndroidSession, connectAndroidSession } from './android';
import { DRIVER_NAME as IOS_DEVICE_NAME, startIOSSession, connectIOSSession } from './ios';

export const reConnectFlutterDriver = async function(this: FlutterDriver, caps: Record<string, any>) {
  // setup proxies - if platformName is not empty, make it less case sensitive
  if (!caps.platformName) {
    this.log.errorAndThrow(`No platformName was given`);
  }

  const appPlatform = _.toLower(caps.platformName);
  switch (appPlatform) {
    case `ios`:
      this.socket = await connectIOSSession(this.proxydriver, caps);
      break;
    case `android`:
      this.socket = await connectAndroidSession(this.proxydriver, caps);
      break;
    default:
      this.log.errorAndThrow(`Unsupported platformName: ${caps.platformName}`);
  }
};

export const createSession: any = async function(this: FlutterDriver, sessionId: string, caps, ...args) {
  try {
    // setup proxies - if platformName is not empty, make it less case sensitive
    if (caps.platformName) {
      const appPlatform = _.toLower(caps.platformName);
      switch (appPlatform) {
        case `ios`:
          [this.proxydriver, this.socket] = await startIOSSession(caps, ...args);
          this.proxydriver.relaxedSecurityEnabled = this.relaxedSecurityEnabled;
          this.proxydriver.denyInsecure = this.denyInsecure;
          this.proxydriver.allowInsecure = this.allowInsecure;
          this.proxydriverName = IOS_DEVICE_NAME;
          break;
        case `android`:
          [this.proxydriver, this.socket] = await startAndroidSession(caps, ...args);
          this.proxydriver.relaxedSecurityEnabled = this.relaxedSecurityEnabled;
          this.proxydriver.denyInsecure = this.denyInsecure;
          this.proxydriver.allowInsecure = this.allowInsecure;
          this.proxydriverName = ANDROID_DEVICE_NAME;
          break;
        default:
          this.log.errorAndThrow(
            `Unsupported platformName: ${caps.platformName}`,
          );
      }
    }

    return [sessionId, this.opts];
  } catch (e) {
    await this.deleteSession();
    throw e;
  }
};

export const deleteSession = async function(this: FlutterDriver) {
  this.log.debug(`Deleting Flutter Driver session`);

  if (this.proxydriver) {
    await this.proxydriver.deleteSession();
    this.proxydriver = null;
  }
};
