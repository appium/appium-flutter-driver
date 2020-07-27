// @ts-ignore
import XCUITestDriver from 'appium-xcuitest-driver';
import { spawn } from 'child_process';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';

const setupNewIOSDriver = async (caps) => {
  const iosArgs = {
    javascriptEnabled: true,
  };

  const iosdriver = new XCUITestDriver(iosArgs);
  const capsCopy = Object.assign({}, caps, { newCommandTimeout: 0 });
  await iosdriver.createSession(capsCopy);

  return iosdriver;
};

export const startIOSSession = async (caps) => {
  log.info(`Starting an IOS proxy session`);
  const iosdriver = await setupNewIOSDriver(caps);
  const observatoryWsUri = getObservatoryWsUri(iosdriver);
  return Promise.all([
    iosdriver,
    connectSocket(await observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
  ]);
};

export const getObservatoryWsUri = async (proxydriver) => {
  const urlObject = processLogToGetobservatory(proxydriver.logs.syslog.logs);
  const { udid, realDevice } = proxydriver.opts;
  if (realDevice) {
    // @todo check if `brew install usbmuxd` is needed
    log.info(`Running on iOS real device, doing "iproxy" now`);
    const args = [urlObject.port, urlObject.port, udid];
    log.debug(`iproxy ${urlObject.port} ${urlObject.port} ${udid}`);
    const cmd = spawn(`iproxy`, args);
    let stdout = ``;
    cmd.stdout.on(`data`, (data) => {
      stdout += data;
      if (stdout.includes(`waiting for connection`)) {
        log.info(`"iproxy" started successfully`);
      } else {
        log.debug(`"iproxy" not started successfully ${stdout}`);
      }
    });
  } else {
    log.info(`Running on iOS simulator, no "iproxy" needed`);
  }
  return urlObject.toJSON();
};
