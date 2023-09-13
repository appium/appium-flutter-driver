import { utilities } from 'appium-ios-device';
import { timing } from '@appium/support';
import XCUITestDriver from 'appium-xcuitest-driver';
import { waitForCondition } from 'asyncbox';
import B from 'bluebird';
import net from 'net';
import { checkPortStatus } from 'portscanner';
import { log } from '../logger';
import { connectSocket, processLogToGetobservatory } from './observatory';

const LOCALHOST = `127.0.0.1`;
const PORT_CLOSE_TIMEOUT = 15 * 1000; // 15 seconds
export const DRIVER_NAME = `XCUITest`;
type IsolateSocket = import('./isolate_socket').IsolateSocket;


const setupNewIOSDriver = async (...args: any[]): Promise<XCUITestDriver> => {
  const iosArgs = {
    javascriptEnabled: true,
  };

  const iosdriver = new XCUITestDriver(iosArgs);
  await iosdriver.createSession(...args);

  return iosdriver;
};

export const startIOSSession = async (
  caps: Record<string, any>, ...args: any[]
): Promise<[XCUITestDriver, IsolateSocket|null]> => {
  log.info(`Starting an IOS proxy session`);
  const iosdriver = await setupNewIOSDriver(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.bundleId === undefined) {
    return [iosdriver, null];
  }

  return Promise.all([
    iosdriver,
    connectSocket(getObservatoryWsUri, iosdriver, caps),
  ]);
};

export const connectIOSSession = async (
  iosdriver: XCUITestDriver, caps: Record<string, any>
): Promise<IsolateSocket> =>
  await connectSocket(getObservatoryWsUri, iosdriver, caps);

const waitForPortIsAvailable = async (port) => {
  let isPortBusy = (await checkPortStatus(port, LOCALHOST)) === `open`;
  if (isPortBusy) {
    log.warn(`Port #${port} is busy. Did you quit the previous driver session(s) properly?`);
    const timer = new timing.Timer().start();
    try {
      await waitForCondition(async () => {
        try {
          if ((await checkPortStatus(port, LOCALHOST)) !== `open`) {
            log.info(`Port #${port} has been successfully released after ` +
              `${timer.getDuration().asMilliSeconds.toFixed(0)}ms`);
            isPortBusy = false;
            return true;
          }
        } catch (ign) {
          log.warn(``);
        }
        return false;
      }, {
        intervalMs: 300,
        waitMs: PORT_CLOSE_TIMEOUT,
      });
    } catch (ign) {
      log.warn(`Did not know how to release port #${port} in ` +
        `${timer.getDuration().asMilliSeconds.toFixed(0)}ms`);
    }
  }

  if (isPortBusy) {
    throw new Error(`The port :${port} is occupied by an other process. ` +
      `You can either quit that process or select another free port.`);
  }
};

export const getObservatoryWsUri = async (
  proxydriver: XCUITestDriver, caps: Record<string, any>
): Promise<string> => {
  let urlObject;
  if (caps.observatoryWsUri) {
    urlObject = new URL(caps.observatoryWsUri);
    urlObject.protocol = `ws`;

    // defaults to skip the port-forwarding as backward compatibility
    if (caps.skipPortForward === undefined || caps.skipPortForward) {
      return urlObject.toJSON();
    }
  } else {
    urlObject = processLogToGetobservatory(proxydriver.logs.syslog.logs);
  }
  if (!proxydriver.isRealDevice()) {
    log.info(`Running on iOS simulator`);
    return urlObject.toJSON();
  }

  const remotePort = urlObject.port;
  const localPort = caps.forwardingPort ?? remotePort;
  urlObject.port = localPort;

  log.info(`Running on iOS real device`);
  const { udid } = proxydriver.opts;
  await waitForPortIsAvailable(localPort);
  const localServer = net.createServer(async (localSocket) => {
    let remoteSocket;
    try {
      remoteSocket = await utilities.connectPort(udid, remotePort);
    } catch (e) {
      localSocket.destroy();
      return;
    }

    const destroyCommChannel = () => {
      remoteSocket.unpipe(localSocket);
      localSocket.unpipe(remoteSocket);
    };
    remoteSocket.once(`close`, () => {
      destroyCommChannel();
      localSocket.destroy();
    });
    localSocket.once(`end`, destroyCommChannel);
    localSocket.once(`close`, () => {
      destroyCommChannel();
      remoteSocket.destroy();
    });
    localSocket.pipe(remoteSocket);
    remoteSocket.pipe(localSocket);
  });
  const listeningPromise = new B((resolve, reject) => {
    localServer.once(`listening`, resolve);
    localServer.once(`error`, reject);
  });
  localServer.listen(localPort);
  try {
    await listeningPromise;
  } catch (e) {
    throw new Error(`Cannot listen on the local port ${localPort}. Original error: ${e.message}`);
  }

  log.info(`Forwarding the remote port ${remotePort} to the local port ${localPort}`);

  process.on(`beforeExit`, () => {
    localServer.close();
  });
  return urlObject.toJSON();
};
