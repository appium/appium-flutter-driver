import { androidHelpers } from 'appium-android-driver';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
export const DRIVER_NAME = `UIAutomator2`;

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

export const startAndroidSession = async (caps, ...args) => {
  log.info(`Starting an Android proxy session`);
  const androiddriver = await setupNewAndroidDriver(...args);
  let observatoryWsUri;
  try {
    observatoryWsUri = await getObservatoryWsUri(androiddriver , caps);
  } catch (e) {
    await androiddriver.deleteSession();
    throw e;
  }
  return Promise.all([
    androiddriver,
    connectSocket(await observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
  ]);

};

export const connectAndroidSession = async (
  androiddriver,
  caps,
  RETRY_BACKOFF: any = 3000,
  MAX_RETRY_COUNT: any = 10,
  ) => {
  log.info(`Connecting to an Android proxy session`);
  let observatoryWsUri;
  try {
    await androiddriver.adb.stopLogcat();
    await androiddriver.adb.startLogcat({
      format: androiddriver.opts.logcatFormat,
      filterSpecs: androiddriver.opts.logcatFilterSpecs,
      clearDeviceLogsOnStart: true
    });

    let retryCount = 0;
    while (true) {
      try {
        observatoryWsUri = await getObservatoryWsUri(androiddriver, caps);
        break;
      } catch (e) {
        if (retryCount < MAX_RETRY_COUNT) {
          retryCount += 1;
          await new Promise((r) => setTimeout(r, RETRY_BACKOFF));
          continue;
        }
        throw e;
      }
    }
  } catch (e) {
    await androiddriver.deleteSession();
    throw e;
  }
  return Promise.all([
    connectSocket(observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
  ]);
};

export const getObservatoryWsUri = async (proxydriver , caps) => {
  const urlObject = processLogToGetobservatory(proxydriver.adb.logcat.logs);
  const {udid} = await androidHelpers.getDeviceInfoFromCaps(caps);
  log.debug(
    `${proxydriver.adb.executable.path} -s ${udid} forward tcp:${
      urlObject.port
    } tcp:${urlObject.port}`,
  );
  await execPromise(
    `${proxydriver.adb.executable.path} -s ${udid} forward tcp:${
      urlObject.port
    } tcp:${urlObject.port}`,
  );

  return urlObject.toJSON();
};
