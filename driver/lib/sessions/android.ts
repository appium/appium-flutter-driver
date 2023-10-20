import AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';
import { InitialOpts } from '@appium/types';

export const DRIVER_NAME = `UIAutomator2`;
type IsolateSocket = import('./isolate_socket').IsolateSocket;


const setupNewAndroidDriver = async (...args: any[]): Promise<AndroidUiautomator2Driver> => {
  const androiddriver = new AndroidUiautomator2Driver({} as InitialOpts);
  // @ts-ignore
  await androiddriver.createSession(...args);

  return androiddriver;
};

export const startAndroidSession = async (
  caps: Record<string, any>, ...args: any[]
): Promise<[AndroidUiautomator2Driver, IsolateSocket|null]> => {
  log.info(`Starting an Android proxy session`);
  const androiddriver = await setupNewAndroidDriver(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.appPackage === undefined) {
    return [androiddriver, null];
  }

  return [
    androiddriver,
    await connectSocket(getObservatoryWsUri, androiddriver, caps),
  ];
};

export const connectAndroidSession = async (
  androiddriver: AndroidUiautomator2Driver, caps: Record<string, any>
): Promise<IsolateSocket> =>
  await connectSocket(getObservatoryWsUri, androiddriver, caps);

export const getObservatoryWsUri = async (proxydriver: AndroidUiautomator2Driver, caps): Promise<string> => {
  let urlObject: URL;
  if (caps.observatoryWsUri) {
    urlObject = new URL(caps.observatoryWsUri);
    urlObject.protocol = `ws`;

    // defaults to skip the port-forwarding as backward compatibility
    if (caps.skipPortForward === undefined || caps.skipPortForward) {
      return urlObject.toJSON();
    }
  } else {
    urlObject = processLogToGetobservatory(proxydriver.adb.logcat!.logs as [{message: string}]);
  }
  const remotePort = urlObject.port;
  const localPort = caps.forwardingPort ?? remotePort;
  urlObject.port = localPort;
  await proxydriver.adb.forwardPort(localPort, remotePort);
  if (!caps.observatoryWsUri && proxydriver.adb.adbHost) {
    urlObject.host = proxydriver.adb.adbHost;
  }
  return urlObject.toJSON();
};
