// @ts-ignore
import AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';
const setupNewAndroidDriver = async (...args) => {
  const androidArgs = {
    javascriptEnabled: true,
  };
  const androiddriver = new AndroidUiautomator2Driver(androidArgs);
  await androiddriver.createSession(...args);

  return androiddriver;
};

export const DRIVER_NAME = `UIAutomator2`;

export const startAndroidSession = async (caps, ...args) => {
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

/**
 * Connect to the latest observaotry URL
 * @param androiddriver
 * @param caps
 * @returns current socket
 */
export const connectAndroidSession = async (androiddriver, caps) =>
  await connectSocket(getObservatoryWsUri, androiddriver, caps);

export const getObservatoryWsUri = async (proxydriver , caps) => {
  let urlObject: URL;
  if (caps.observatoryWsUri) {
    urlObject = new URL(caps.observatoryWsUri);
    urlObject.protocol = `ws`;

    // defaults to skip the port-forwarding as backward compatibility
    if (caps.skipPortForward === undefined || caps.skipPortForward) {
      return urlObject.toJSON();
    }
  } else {
    urlObject = processLogToGetobservatory(proxydriver.adb.logcat.logs);
  }
  const remotePort = urlObject.port;
  const localPort = caps.forwardingPort ?? remotePort;
  urlObject.port = localPort;
  log.debug(`Forwarding remote port ${remotePort} to the local port ${localPort}`);
  await proxydriver.adb.forwardPort(localPort, remotePort);
  if (!caps.observatoryWsUri && proxydriver.adb.adbHost) {
    urlObject.host = proxydriver.adb.adbHost;
  }
  return urlObject.toJSON();
};
