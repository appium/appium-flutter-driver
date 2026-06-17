import {utilities} from 'appium-ios-device';
import {XCUITestDriver} from 'appium-xcuitest-driver';
import B from 'bluebird';
import net from 'node:net';
import {checkPortStatus} from 'portscanner';
import {connectSocket, extractObservatoryUrl, OBSERVATORY_URL_PATTERN} from './observatory';
import type {IsolateSocket} from './isolate_socket';
import {LogMonitor} from './log-monitor';
import type {LogEntry} from './log-monitor';
import type {FlutterDriver} from '../driver';
import type {XCUITestDriverOpts} from 'appium-xcuitest-driver/build/lib/driver';

const LOCALHOST = `127.0.0.1`;

const VM_SERVICE_PORT_FLAG = `--vm-service-port`;
const DISABLE_SERVICE_AUTH_CODES_FLAG = `--disable-service-auth-codes`;

export async function startIOSSession(
  this: FlutterDriver,
  caps: Record<string, any>,
  ...args: any[]
): Promise<[XCUITestDriver, IsolateSocket | null]> {
  this.log.info(`Starting an IOS proxy session`);
  injectDartVmServicePortFlags(caps);
  const iosdriver = new XCUITestDriver({} as XCUITestDriverOpts);
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
  // @ts-expect-error can be ignored
  await iosdriver.createSession(...args);

  // the session starts without any apps
  if (caps.app === undefined && caps.bundleId === undefined) {
    return [iosdriver, null];
  }

  // appium-xcuitest starts the device-log capture by spawning `xcrun simctl spawn <udid> log
  // stream`, which on loaded CI simulators intermittently fails to start ("The process did not
  // start within 10000ms") or hits a transient "Simulator is not running". appium swallows that
  // error ("Continuing without capturing device logs") without retrying, leaving `this._logmon`
  // unset — and since the Dart VM Service URL binds a random, auth-coded port that can only be read
  // from that log, getObservatoryWsUri() below would throw "mandatory syslog service must be
  // running". Re-invoke the capture a few times: a success re-emits `syslogStarted`, which the
  // once-handler registered above turns into `this._logmon`. Only the log-discovery path needs it.
  if (!caps.observatoryWsUri && !this._logmon) {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts && !this._logmon; attempt += 1) {
      this.log.warn(
        `Device-log capture did not start during session create; retrying (attempt ${attempt}/${maxAttempts})`,
      );
      await B.delay(2000);
      try {
        await iosdriver.startLogCapture();
      } catch (e) {
        this.log.debug(`startLogCapture retry ${attempt} failed: ${(e as Error).stack ?? e}`);
      }
    }
    if (!this._logmon) {
      this.log.warn(
        `Device-log capture still not started after ${maxAttempts} retries; ` +
          `getObservatoryWsUri will fall back to dartVmServicePort if set, otherwise fail.`,
      );
    }
  }

  return [iosdriver, await connectIOSSession.bind(this)(iosdriver, caps)];
}

export async function connectIOSSession(
  this: FlutterDriver,
  iosdriver: XCUITestDriver,
  caps: Record<string, any>,
  clearLog: boolean = false,
): Promise<IsolateSocket> {
  const observatoryWsUri = await getObservatoryWsUri.bind(this)(iosdriver, caps, clearLog);
  return await connectSocket.bind(this)(observatoryWsUri, iosdriver, caps);
}

/**
 * If `dartVmServicePort` capability is set, mutate `caps.processArguments.args`
 * so the Flutter engine binds the Dart VM service to that exact port at launch,
 * with auth codes disabled so the well-known fallback URL is reachable.
 *
 * Two flags are injected:
 *   * `--vm-service-port=<port>` — tells the engine which port to bind.
 *     Requires Flutter >=3.10 (engine commit 396c7fd0bd, Jan 2023). The
 *     legacy `--observatory-port` alias is intentionally not injected here.
 *   * `--disable-service-auth-codes` — drops the random auth-code path
 *     component from the service URL. Without this, the engine binds to
 *     `http://127.0.0.1:<port>/<auth>/`, and a fallback constructed without
 *     observing the auth code would fail the WebSocket handshake.
 *
 * Any pre-existing `--vm-service-port=*` entries in `caps.processArguments.args`
 * are stripped first so this cap is the authoritative source for the port.
 * Other entries (including a user-supplied `--observatory-port=*`) are left
 * untouched.
 *
 * If `dartVmServicePort` is not set, the caps are left untouched.
 * @param caps The W3C capabilities passed to the driver session.
 */
function injectDartVmServicePortFlags(caps: Record<string, any>): void {
  const port = caps.dartVmServicePort;
  if (typeof port !== 'number') {
    return;
  }
  caps.processArguments ??= {};
  const existing: any[] = Array.isArray(caps.processArguments.args)
    ? caps.processArguments.args
    : [];
  const filtered = existing.filter(
    (arg) => typeof arg !== 'string' || !arg.startsWith(`${VM_SERVICE_PORT_FLAG}=`),
  );
  filtered.push(`${VM_SERVICE_PORT_FLAG}=${port}`);
  if (!filtered.some((arg) => typeof arg === 'string' && arg === DISABLE_SERVICE_AUTH_CODES_FLAG)) {
    filtered.push(DISABLE_SERVICE_AUTH_CODES_FLAG);
  }
  caps.processArguments.args = filtered;
}

async function requireFreePort(this: FlutterDriver, port: number) {
  // Try to close existing local server if it exists
  if (this.localServer) {
    this.log.info(`Closing existing local server on port ${port}`);
    await new Promise<void>((resolve) => {
      this.localServer?.close((err) => {
        if (err) {
          this.log.error(`Error occurred while closing the local server: ${err.message}`);
          return resolve(); // Resolve even if there's an error to avoid hanging
        }
        this.log.info(`Previous local server closed`);
        resolve();
      });
    });
  }
  if ((await checkPortStatus(port, LOCALHOST)) !== `open`) {
    return;
  }
  this.log.warn(`Port #${port} is busy. Did you quit the previous driver session(s) properly?`);
  throw new Error(
    `The port :${port} is occupied by an other process. ` +
      `You can either quit that process or select another free port.`,
  );
}

export async function getObservatoryWsUri(
  this: FlutterDriver,
  proxydriver: XCUITestDriver,
  caps: Record<string, any>,
  clearLog: boolean = false,
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
      // If `dartVmServicePort` is set, the engine was instructed to bind to
      // that exact port at launch via the flags injected by
      // `injectDartVmServicePortFlags`. The syslog line normally confirms this,
      // but iOS unified-logging privacy filters can silently drop the Flutter
      // framework's "Dart VM service is listening on …" line on some launches.
      // Fall back to the requested port — the engine is reachable there.
      if (typeof caps.dartVmServicePort === 'number') {
        this.log.info(
          `LogMonitor scan exhausted; falling back to ` +
            `dartVmServicePort=${caps.dartVmServicePort} from capabilities`,
        );
        urlObject = new URL(`ws://${LOCALHOST}:${caps.dartVmServicePort}/ws`);
      } else {
        throw new Error(
          `No observatory URL matching to '${OBSERVATORY_URL_PATTERN}' was found in the device log. ` +
            `Please make sure the application under test is configured properly according to ` +
            `https://github.com/appium/appium-flutter-driver#usage and that it does not crash on startup.`,
        );
      }
    } else {
      urlObject = extractObservatoryUrl(lastMatch) as URL;
    }
  }
  if (!proxydriver.isRealDevice()) {
    this.log.info(`Running on iOS simulator`);
    return urlObject.toJSON();
  }

  const remotePort = urlObject.port;
  const localPort = caps.forwardingPort ?? remotePort;
  urlObject.port = localPort;

  this.log.info(`Running on iOS real device`);
  const {udid} = proxydriver.opts;
  await requireFreePort.bind(this)(localPort);
  this.localServer = net.createServer(async (localSocket) => {
    let remoteSocket;
    try {
      remoteSocket = await utilities.connectPort(udid, remotePort);
    } catch {
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
