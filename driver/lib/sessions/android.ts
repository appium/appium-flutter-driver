import { exec } from 'child_process';
import { promisify } from 'util';
import { androidHelpers } from 'appium-android-driver';
const execPromise = promisify(exec);

// @ts-ignore
import AndroidDriver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';
log.info(`---debug`);
log.info(androidHelpers);
log.info(`---debug`);
const setupNewAndroidDriver = async (caps) => {
  const androidArgs = {
    javascriptEnabled: true,
  };
  const androiddriver = new AndroidDriver(androidArgs);
  const capsCopy = Object.assign({}, caps, { newCommandTimeout: 0 });

  await androiddriver.createSession(capsCopy);

  return androiddriver;
};

export const startAndroidSession = async (caps) => {
  log.info(`Starting an Android proxy session`);
  const androiddriver = await setupNewAndroidDriver(caps);
  const observatoryWsUri = getObservatoryWsUri(androiddriver , caps);
  return Promise.all([
    androiddriver,
    connectSocket(await observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
  ]);

};

export const getObservatoryWsUri = async (proxydriver , caps) => {
  const urlObject = processLogToGetobservatory(proxydriver.adb.logcat.logs);
  
  let {udid, emPort} = await androidHelpers.getDeviceInfoFromCaps(caps);
  
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
