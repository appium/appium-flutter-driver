import { utilities } from 'appium-ios-device';
import XCUITestDriver from 'appium-xcuitest-driver';
import B from 'bluebird';
import net from 'net';
import { checkPortStatus } from 'portscanner';
import { log } from '../logger';
import { connectSocket, fetchObservatoryUrl } from './observatory';
import type { InitialOpts } from '@appium/types';
import type { IsolateSocket } from './isolate_socket';
import { FlutterDriver } from '../driver';

const LOCALHOST = `127.0.0.1`;

const setupNewIOSDriver = async (...args: any[]): Promise<XCUITestDriver> => {
  const iosdriver = new XCUITestDriver({} as InitialOpts);
  await iosdriver.createSession(...args);
  return iosdriver;
};

export const startIOSSession = async (
  flutterDriver: FlutterDriver,
  caps: Record<string, any>, ...args: any[]
): Promise<[XCUITestDriver, IsolateSocket|null]> => {
  log.info(`Starting an IOS proxy session`);
  const iosdriver = await setupNewIOSDriver(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.bundleId === undefined) {
    return [iosdriver, null];
  }

  return [
    iosdriver,
    await connectSocket(getObservatoryWsUri, flutterDriver, iosdriver, caps),
  ];
};

export const connectIOSSession = async (
  flutterDriver: FlutterDriver,
  iosdriver: XCUITestDriver, caps: Record<string, any>
): Promise<IsolateSocket> =>
  await connectSocket(getObservatoryWsUri, flutterDriver, iosdriver, caps);

async function requireFreePort (port: number) {
  if ((await checkPortStatus(port, LOCALHOST)) !== `open`) {
    return;
  }
  log.warn(`Port #${port} is busy. Did you quit the previous driver session(s) properly?`);
  throw new Error(`The port :${port} is occupied by an other process. ` +
    `You can either quit that process or select another free port.`);
}

export const getObservatoryWsUri = async (
  flutterDriver: FlutterDriver,
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
    urlObject = fetchObservatoryUrl(proxydriver.logs.syslog.logs);
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
  await requireFreePort(localPort);
  flutterDriver.localServer = net.createServer(async (localSocket) => {
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
    remoteSocket.on('error', (e) => log.debug(e));

    localSocket.once(`end`, destroyCommChannel);
    localSocket.once(`close`, () => {
      destroyCommChannel();
      remoteSocket.destroy();
    });
    localSocket.on('error', (e) => log.warn(e.message));
    localSocket.pipe(remoteSocket);
    remoteSocket.pipe(localSocket);
  });
  const listeningPromise = new B((resolve, reject) => {
    flutterDriver.localServer?.once(`listening`, resolve);
    flutterDriver.localServer?.once(`error`, reject);
  });
  flutterDriver.localServer?.listen(localPort);
  try {
    await listeningPromise;
  } catch (e) {
    flutterDriver.localServer = null;
    throw new Error(`Cannot listen on the local port ${localPort}. Original error: ${e.message}`);
  }

  log.info(`Forwarding the remote port ${remotePort} to the local port ${localPort}`);

  process.on(`beforeExit`, () => {
    flutterDriver.localServer?.close();
    flutterDriver.localServer = null;
  });
  return urlObject.toJSON();
};
