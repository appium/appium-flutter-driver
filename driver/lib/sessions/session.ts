import type {AndroidUiautomator2Driver} from 'appium-uiautomator2-driver';
import type {XCUITestDriver} from 'appium-xcuitest-driver';
import _ from 'lodash';

import type {FlutterDriver} from '../driver.js';
import {PLATFORM} from '../platform.js';
import {startAndroidSession, connectAndroidSession} from './android.js';
import {startIOSSession, connectIOSSession} from './ios.js';

export const reConnectFlutterDriver = async function (this: FlutterDriver, caps: Record<string, any>) {
  // setup proxies - if platformName is not empty, make it less case sensitive
  if (!caps.platformName) {
    this.log.errorWithException(new Error(`No platformName was given`));
  }

  switch (_.toLower(caps.platformName)) {
    case PLATFORM.IOS:
      this.socket = await connectIOSSession.bind(this)(this.proxydriver, caps, true);
      break;
    case PLATFORM.ANDROID:
      this.socket = await connectAndroidSession.bind(this)(this.proxydriver, caps, true);
      break;
    default:
      this.log.errorWithException(
        new Error(
          `Unsupported platformName: ${caps.platformName}. ` +
            `Only the following platforms are supported: ${_.keys(PLATFORM)}`,
        ),
      );
  }
};

export const createSession: any = async function (this: FlutterDriver, sessionId: string, caps, ...args) {
  try {
    // setup proxies - if platformName is not empty, make it less case sensitive
    switch (_.toLower(caps.platformName)) {
      case PLATFORM.IOS:
        [this.proxydriver, this.socket] = await startIOSSession.bind(this)(caps, ...args);
        (this.proxydriver as XCUITestDriver).relaxedSecurityEnabled = this.relaxedSecurityEnabled;
        (this.proxydriver as XCUITestDriver).denyInsecure = this.denyInsecure;
        (this.proxydriver as XCUITestDriver).allowInsecure = this.allowInsecure;

        break;
      case PLATFORM.ANDROID:
        [this.proxydriver, this.socket] = await startAndroidSession.bind(this)(caps, ...args);
        (this.proxydriver as AndroidUiautomator2Driver).relaxedSecurityEnabled = this.relaxedSecurityEnabled;
        (this.proxydriver as AndroidUiautomator2Driver).denyInsecure = this.denyInsecure;
        (this.proxydriver as AndroidUiautomator2Driver).allowInsecure = this.allowInsecure;
        break;
      default:
        this.log.errorWithException(
          new Error(
            `Unsupported platformName: ${caps.platformName}. ` +
              `Only the following platforms are supported: ${_.keys(PLATFORM)}`,
          ),
        );
    }

    return [sessionId, this.opts];
  } catch (e) {
    await this.deleteSession();
    throw e;
  }
};
