import { exec } from 'child_process';
import { promisify } from 'util';
import ADB from 'appium-adb';
const execPromise = promisify(exec);

// @ts-ignore
import AndroidDriver from 'appium-uiautomator2-driver';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';

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
  const observatoryWsUri = getObservatoryWsUri(androiddriver);
  return Promise.all([
    androiddriver,
    connectSocket(await observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
  ]);

};

export const getObservatoryWsUri = async (proxydriver) => {
  const urlObject = processLogToGetobservatory(proxydriver.adb.logcat.logs);
  const a = ADB.getRunningAVD("Nexus_10_API_30");
  log.info(a);
  log.debug(
    `${proxydriver.adb.executable.path} forward tcp:${
      urlObject.port
    } tcp:${urlObject.port}`,
  );
  await execPromise(
    `${proxydriver.adb.executable.path} forward tcp:${
      urlObject.port
    } tcp:${urlObject.port}`,
  );

  return urlObject.toJSON();
};
