import XCUITestDriver from 'appium-xcuitest-driver';

import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';

const setupNewIOSDriver = async (caps)  => {
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
    connectSocket(observatoryWsUri),
  ]);
};

export const getObservatoryWsUri = (proxydriver) => {
  const urlObject = processLogToGetobservatory(proxydriver.logs.syslog.logs);
  return urlObject.toJSON();
};
