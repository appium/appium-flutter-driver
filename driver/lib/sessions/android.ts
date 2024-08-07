import AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import { connectSocket, extractObservatoryUrl, OBSERVATORY_URL_PATTERN } from './observatory';
import type { InitialOpts, StringRecord } from '@appium/types';
import type { IsolateSocket } from './isolate_socket';
import { FlutterDriver } from '../driver';
import { LogMonitor } from './log-monitor';
import type { LogEntry } from './log-monitor';

export async function startAndroidSession(
  this: FlutterDriver,
  caps: Record<string, any>,
  ...args: any[]
): Promise<[AndroidUiautomator2Driver, IsolateSocket|null]> {
  this.log.info(`Starting an Android proxy session`);
  const androiddriver = new AndroidUiautomator2Driver({} as InitialOpts);
  if (!caps.observatoryWsUri) {
    androiddriver.eventEmitter.once('syslogStarted', (syslog) => {
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
  //@ts-ignore Args are ok
  await androiddriver.createSession(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.appPackage === undefined) {
    return [androiddriver, null];
  }

  return [
    androiddriver,
    await connectAndroidSession.bind(this)(androiddriver, caps),
  ];
}

export async function connectAndroidSession (
  this: FlutterDriver,
  androiddriver: AndroidUiautomator2Driver,
  caps: Record<string, any>,
  clearLog: boolean = false
): Promise<IsolateSocket> {
  const observatoryWsUri = await getObservatoryWsUri.bind(this)(androiddriver, caps, clearLog);
  return await connectSocket.bind(this)(observatoryWsUri, caps);
}

export async function getObservatoryWsUri (
  this: FlutterDriver,
  proxydriver: AndroidUiautomator2Driver,
  caps: StringRecord,
  clearLog: boolean = false
): Promise<string> {
  if (clearLog) {
    this._logmon?.clearlastMatch();
    this._logmon?.stop();
    this._logmon?.start();
  }

  let urlObject: URL;
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
        `The mandatory logcat service must be running in order to initialize the Flutter driver. ` +
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
  const remotePort = urlObject.port;
  this.portForwardLocalPort = caps.forwardingPort ?? remotePort;
  urlObject.port = this.portForwardLocalPort as string;
  await proxydriver.adb.forwardPort(this.portForwardLocalPort as string, remotePort);
  if (!caps.observatoryWsUri && proxydriver.adb.adbHost) {
    urlObject.host = proxydriver.adb.adbHost;
  }
  return urlObject.toJSON();
}
