import { utilities } from 'appium-ios-device';
import XCUITestDriver from 'appium-xcuitest-driver';
import B from 'bluebird';
import net from 'net';
import { checkPortStatus } from 'portscanner';
import {
  connectSocket,
  extractObservatoryUrl,
  OBSERVATORY_URL_PATTERN
} from './observatory';
import type { InitialOpts } from '@appium/types';
import type { IsolateSocket } from './isolate_socket';
import { LogMonitor } from './log-monitor';
import type { LogEntry } from './log-monitor';
import type { FlutterDriver } from '../driver';

const LOCALHOST = `127.0.0.1`;

export async function startIOSSession(
  this: FlutterDriver,
  caps: Record<string, any>, ...args: any[]
): Promise<[XCUITestDriver, IsolateSocket|null]> {
  this.log.info(`Starting an IOS proxy session`);
  const iosdriver = new XCUITestDriver({} as InitialOpts);
  if (!caps.observatoryWsUri) {
    iosdriver.eventEmitter.once('syslogStarted', (syslog) => {
      this._logmon = new LogMonitor(syslog, async (entry: LogEntry) => {
        if (extractObservatoryUrl(entry)) {
          this.log.debug(`Matched the syslog line '${entry.message}'`);
          return true;
        }
        return false;
      });
      this._logmon.start();
    });
  }
  await iosdriver.createSession(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.bundleId === undefined) {
    return [iosdriver, null];
  }

  return [
    iosdriver,
    await connectIOSSession.bind(this)(iosdriver, caps),
  ];
}

export async function connectIOSSession(
  this: FlutterDriver,
  iosdriver: XCUITestDriver,
  caps: Record<string, any>,
  clearLog: boolean = false
): Promise<IsolateSocket> {
  const observatoryWsUri = await getObservatoryWsUri.bind(this)(iosdriver, caps, clearLog);
  return await connectSocket.bind(this)(observatoryWsUri, iosdriver, caps);
}

async function requireFreePort(
  this: FlutterDriver,
  port: number
) {
  if ((await checkPortStatus(port, LOCALHOST)) !== `open`) {
    return;
  }
  this.log.warn(`Port #${port} is busy. Did you quit the previous driver session(s) properly?`);
  throw new Error(`The port :${port} is occupied by an other process. ` +
    `You can either quit that process or select another free port.`);
}

export async function getObservatoryWsUri (
  this: FlutterDriver,
  proxydriver: XCUITestDriver, caps: Record<string, any>,
  clearLog: boolean = false
): Promise<string> {
  if (clearLog) {
    this._logmon?.clearlastMatch();
    this._logmon?.stop();
    this._logmon?.start();
  }

  let urlObject;
  if (caps.observatoryWsUri) {
    urlObject = new URL(caps.observatoryWsUri);
    urlObject.protocol = `ws`;

    // defaults to skip the port-forwarding as backward compatibility
    if (caps.skipPortForward === undefined || caps.skipPortForward) {
      return urlObject.toJSON();
    }
  } else {
    if (!this._logmon) {
      throw new Error(
        `The mandatory syslog service must be running in order to initialize the Flutter driver. ` +
        `Have you disabled it in capabilities?`
      );
    }
    const lastMatch = await this._logmon.waitForLastMatchExist(
      caps.maxRetryCount,
      caps.retryBackoffTime
    );
    if (!lastMatch) {
      throw new Error(
        `No observatory URL matching to '${OBSERVATORY_URL_PATTERN}' was found in the device log. ` +
        `Please make sure the application under test is configured properly according to ` +
        `https://github.com/appium/appium-flutter-driver#usage and that it does not crash on startup.`
      );
    }
    urlObject = extractObservatoryUrl(lastMatch) as URL;
  }
  if (!proxydriver.isRealDevice()) {
    this.log.info(`Running on iOS simulator`);
    return urlObject.toJSON();
  }

  const remotePort = urlObject.port;
  const localPort = caps.forwardingPort ?? remotePort;
  urlObject.port = localPort;

  this.log.info(`Running on iOS real device`);
  const { udid } = proxydriver.opts;
  await requireFreePort.bind(this)(localPort);
  this.localServer = net.createServer(async (localSocket) => {
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
    remoteSocket.on('error', (e) => this.log.debug(e));

    localSocket.once(`end`, destroyCommChannel);
    localSocket.once(`close`, () => {
      destroyCommChannel();
      remoteSocket.destroy();
    });
    localSocket.on('error', (e) => this.log.warn(e.message));
    localSocket.pipe(remoteSocket);
    remoteSocket.pipe(localSocket);
  });
  const listeningPromise = new B((resolve, reject) => {
    this.localServer?.once(`listening`, resolve);
    this.localServer?.once(`error`, reject);
  });
  this.localServer?.listen(localPort);
  try {
    await listeningPromise;
  } catch (e) {
    this.localServer = null;
    throw new Error(`Cannot listen on the local port ${localPort}. Original error: ${e.message}`);
  }

  this.log.info(`Forwarding the remote port ${remotePort} to the local port ${localPort}`);

  process.on(`beforeExit`, () => {
    this.localServer?.close();
    this.localServer = null;
  });
  return urlObject.toJSON();
}
