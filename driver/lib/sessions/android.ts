import { androidHelpers } from 'appium-android-driver';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// @ts-ignore
import AndroidDriver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';
const setupNewAndroidDriver = async (...args) => {
  const androidArgs = {
    javascriptEnabled: true,
  };
  const androiddriver = new AndroidDriver(androidArgs);
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
  };
  return Promise.all([
    androiddriver,
    connectSocket(await observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
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
