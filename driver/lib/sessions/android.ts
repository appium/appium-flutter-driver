import {AndroidUiautomator2Driver} from 'appium-uiautomator2-driver';
import {connectSocket, extractObservatoryUrl, OBSERVATORY_URL_PATTERN} from './observatory';
import type {InitialOpts, StringRecord} from '@appium/types';
import type {IsolateSocket} from './isolate_socket';
import {FlutterDriver} from '../driver';
import {LogMonitor} from './log-monitor';
import type {LogEntry} from './log-monitor';

const VM_SERVICE_PORT_EXTRA = `vm-service-port`;
const DISABLE_SERVICE_AUTH_CODES_EXTRA = `disable-service-auth-codes`;

/**
 * Android analogue of iOS's `injectDartVmServicePortFlags`. iOS injects engine switches via
 * `processArguments`; Android has no such launch-args channel, but Flutter's Android embedding
 * (`FlutterShellArgs.fromIntent`) reads two launch-intent extras:
 *
 *   * `vm-service-port` (int) → the `--vm-service-port=<port>` engine switch — binds the Dart VM
 *     service to that exact port instead of a random one.
 *   * `disable-service-auth-codes` (bool) → `--disable-service-auth-codes` — drops the random
 *     auth-code path so the well-known `ws://<host>:<port>/ws` URL is reachable.
 *
 * uiautomator2 appends `optionalIntentArguments` to the `am start` that launches the app, so when
 * `dartVmServicePort` is set we add `--ei vm-service-port <port> --ez disable-service-auth-codes
 * true` there. CRITICAL: the proxydriver launches the app from the createSession `args` (a deep
 * clone of the original capabilities — see driver.ts), NOT from the post-`super.createSession`
 * `caps` object; mutating `caps` is a no-op for the launch. So we set the cap on the capability
 * objects *inside* `args`, covering both the W3C (`alwaysMatch`) and JSONWP (flat) shapes, and
 * strip any prior `vm-service-port` extra so this cap is authoritative. Flutter's own tooling
 * discovers the port from the log instead, but the embedding honours the extra.
 *
 * If `dartVmServicePort` is not set, the args are left untouched.
 */
function injectDartVmServicePortIntentArgs(caps: Record<string, any>, args: any[]): void {
  const port = caps.dartVmServicePort;
  if (typeof port !== 'number') {
    return;
  }
  const injected = `--ei ${VM_SERVICE_PORT_EXTRA} ${port} --ez ${DISABLE_SERVICE_AUTH_CODES_EXTRA} true`;
  const merge = (existing: unknown): string => {
    const base =
      typeof existing === 'string'
        ? existing
            .replace(/--ei\s+vm-service-port\s+\d+/g, ' ')
            .replace(/--ez\s+disable-service-auth-codes\s+true/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        : '';
    return base ? `${base} ${injected}` : injected;
  };
  for (const a of args) {
    if (!a || typeof a !== 'object' || Array.isArray(a)) {
      continue;
    }
    if (a.alwaysMatch && typeof a.alwaysMatch === 'object') {
      a.alwaysMatch['appium:optionalIntentArguments'] = merge(a.alwaysMatch['appium:optionalIntentArguments']);
    } else if ('platformName' in a || 'appium:automationName' in a || 'optionalIntentArguments' in a) {
      (a as Record<string, unknown>).optionalIntentArguments = merge((a as Record<string, unknown>).optionalIntentArguments);
    }
  }
}

export async function startAndroidSession(
  this: FlutterDriver,
  caps: Record<string, any>,
  ...args: any[]
): Promise<[AndroidUiautomator2Driver, IsolateSocket | null]> {
  this.log.info(`Starting an Android proxy session`);
  injectDartVmServicePortIntentArgs(caps, args);
  if (typeof caps.dartVmServicePort === `number`) {
    this.log.info(
      `Pinning Dart VM Service to port ${caps.dartVmServicePort} via the vm-service-port launch-intent extra`,
    );
  }
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

  return [androiddriver, await connectAndroidSession.bind(this)(androiddriver, caps)];
}

export async function connectAndroidSession(
  this: FlutterDriver,
  androiddriver: AndroidUiautomator2Driver,
  caps: Record<string, any>,
  clearLog: boolean = false,
): Promise<IsolateSocket> {
  const observatoryWsUri = await getObservatoryWsUri.bind(this)(androiddriver, caps, clearLog);
  this.connectedVmServiceUrl = observatoryWsUri;
  return await connectSocket.bind(this)(observatoryWsUri, caps);
}

export async function getObservatoryWsUri(
  this: FlutterDriver,
  proxydriver: AndroidUiautomator2Driver,
  caps: StringRecord,
  clearLog: boolean = false,
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
          `Have you disabled it in capabilities?`,
      );
    }

    let lastMatch: LogEntry | null = null;
    try {
      lastMatch = await this._logmon.waitForLastMatchExist(
        caps.maxRetryCount,
        caps.retryBackoffTime,
      );
    } catch (e) {
      this.log.error(e);
    }
    if (!lastMatch) {
      throw new Error(
        `No observatory URL matching to '${OBSERVATORY_URL_PATTERN}' was found in the device log. ` +
          `Please make sure the application under test is configured properly according to ` +
          `https://github.com/appium/appium-flutter-driver#usage and that it does not crash on startup.`,
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
