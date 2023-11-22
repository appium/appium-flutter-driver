import AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, fetchObservatoryUrl } from './observatory';
import type { InitialOpts } from '@appium/types';
import type { IsolateSocket } from './isolate_socket';
import { FlutterDriver } from '../driver';

const setupNewAndroidDriver = async (...args: any[]): Promise<AndroidUiautomator2Driver> => {
  const androiddriver = new AndroidUiautomator2Driver({} as InitialOpts);
  //@ts-ignore Args are ok
  await androiddriver.createSession(...args);
  return androiddriver;
};

export const startAndroidSession = async (
  flutterDriver: FlutterDriver,
  caps: Record<string, any>,
  ...args: any[]
): Promise<[AndroidUiautomator2Driver, IsolateSocket|null]> => {
  log.info(`Starting an Android proxy session`);
  const androiddriver = await setupNewAndroidDriver(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.appPackage === undefined) {
    return [androiddriver, null];
  }

  return [
    androiddriver,
    await connectSocket(getObservatoryWsUri, flutterDriver, androiddriver, caps),
  ];
};

export const connectAndroidSession = async (
  flutterDriver: FlutterDriver, androiddriver: AndroidUiautomator2Driver, caps: Record<string, any>
): Promise<IsolateSocket> =>
  await connectSocket(getObservatoryWsUri, flutterDriver, androiddriver, caps);

export const getObservatoryWsUri = async (
  flutterDriver: FlutterDriver,
  proxydriver: AndroidUiautomator2Driver,
  caps): Promise<string> => {
  let urlObject: URL;
  if (caps.observatoryWsUri) {
    urlObject = new URL(caps.observatoryWsUri);
    urlObject.protocol = `ws`;

    // defaults to skip the port-forwarding as backward compatibility
    if (caps.skipPortForward === undefined || caps.skipPortForward) {
      return urlObject.toJSON();
    }
  } else {
    urlObject = fetchObservatoryUrl(proxydriver.adb.logcat!.logs as [{message: string}]);
  }
  const remotePort = urlObject.port;
  flutterDriver.portForwardLocalPort = caps.forwardingPort ?? remotePort;
  urlObject.port = flutterDriver.portForwardLocalPort!;
  await proxydriver.adb.forwardPort(flutterDriver.portForwardLocalPort!, remotePort);
  if (!caps.observatoryWsUri && proxydriver.adb.adbHost) {
    urlObject.host = proxydriver.adb.adbHost;
  }
  return urlObject.toJSON();
};
