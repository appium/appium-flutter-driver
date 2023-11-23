import type { FlutterDriver } from '../driver';
import _ from 'lodash';
import {
  startAndroidSession, connectAndroidSession
} from './android';
import {
  startIOSSession, connectIOSSession
} from './ios';
import { PLATFORM } from '../platform';


export const reConnectFlutterDriver = async function(this: FlutterDriver, caps: Record<string, any>) {
  // setup proxies - if platformName is not empty, make it less case sensitive
  if (!caps.platformName) {
    this.log.errorAndThrow(`No platformName was given`);
  }

  switch (_.toLower(caps.platformName)) {
    case PLATFORM.IOS:
      this.socket = await connectIOSSession(this, this.proxydriver, caps);
      break;
    case PLATFORM.ANDROID:
      this.socket = await connectAndroidSession(this, this.proxydriver, caps);
      break;
    default:
      this.log.errorAndThrow(
        `Unsupported platformName: ${caps.platformName}. ` +
        `Only the following platforms are supported: ${_.keys(PLATFORM)}`
      );
  }
};

export const createSession: any = async function(this: FlutterDriver, sessionId: string, caps, ...args) {
  try {
    // setup proxies - if platformName is not empty, make it less case sensitive
    switch (_.toLower(caps.platformName)) {
      case PLATFORM.IOS:
        [this.proxydriver, this.socket] = await startIOSSession(this, caps, ...args);
        this.proxydriver.relaxedSecurityEnabled = this.relaxedSecurityEnabled;
        this.proxydriver.denyInsecure = this.denyInsecure;
        this.proxydriver.allowInsecure = this.allowInsecure;

        break;
      case PLATFORM.ANDROID:
        [this.proxydriver, this.socket] = await startAndroidSession(this, caps, ...args);
        this.proxydriver.relaxedSecurityEnabled = this.relaxedSecurityEnabled;
        this.proxydriver.denyInsecure = this.denyInsecure;
        this.proxydriver.allowInsecure = this.allowInsecure;
        break;
      default:
        this.log.errorAndThrow(
          `Unsupported platformName: ${caps.platformName}. ` +
          `Only the following platforms are supported: ${_.keys(PLATFORM)}`
        );
    }

    return [sessionId, this.opts];
  } catch (e) {
    await this.deleteSession();
    throw e;
  }
};
