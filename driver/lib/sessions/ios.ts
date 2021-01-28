// @ts-ignore
import XCUITestDriver from 'appium-xcuitest-driver';
import { utilities } from 'appium-ios-device';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';
import net from 'net';

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
  const observatoryWsUri = await getObservatoryWsUri(iosdriver);
  return Promise.all([
    iosdriver,
    connectSocket(observatoryWsUri, caps.retryBackoffTime, caps.maxRetryCount),
  ]);
};

export const getObservatoryWsUri = async (proxydriver) => {
  let urlObject;
  try {
    urlObject = processLogToGetobservatory(proxydriver.logs.syslog.logs);
  } catch (err) {
    log.errorAndThrow(`Failed to get the device log: ${err.message}`);
  };

  const { udid } = proxydriver.opts;

  if (proxydriver.isRealDevice()) {
    log.info('Running on iOS real device');
    const localServer = net.createServer(async (localSocket) => {
      let remoteSocket;
      try {
        remoteSocket = await utilities.connectPort(udid, urlObject.port);
      } catch (e) {
        localSocket.destroy();
        return;
      }

      const destroyCommChannel = () => {
        remoteSocket.unpipe(localSocket);
        localSocket.unpipe(remoteSocket);
      };
      remoteSocket.once('close', () => {
        destroyCommChannel();
        localSocket.destroy();
      });
      localSocket.once('end', destroyCommChannel);
      localSocket.once('close', () => {
        destroyCommChannel();
        remoteSocket.destroy();
      });
      localSocket.pipe(remoteSocket);
      remoteSocket.pipe(localSocket);
    });
    localServer.listen(urlObject.port);
    log.info(`Port forwarding to: ${urlObject.port}`);
  } else {
    log.info('Running on iOS simulator');
  }

  return urlObject.toJSON();
};
