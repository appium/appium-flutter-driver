// @ts-ignore: no 'errors' export module
import _ from 'lodash';
import { BaseDriver } from 'appium/driver';
import { log as logger } from './logger';
import {
  executeElementCommand, executeGetVMCommand, executeGetIsolateCommand
} from './sessions/observatory';
import { PLATFORM } from './platform';
import { createSession, reConnectFlutterDriver } from './sessions/session';
import {
  driverShouldDoProxyCmd, FLUTTER_CONTEXT_NAME,
  getContexts, getCurrentContext, NATIVE_CONTEXT_NAME, setContext
} from './commands/context';
import { clear, getText, setValue } from './commands/element';
import { execute } from './commands/execute';
import { click, longTap, performTouch, tap, tapEl } from './commands/gesture';
import { getScreenshot } from './commands/screen';
import { getClipboard, setClipboard } from './commands/clipboard';
import { desiredCapConstraints } from './desired-caps';
import XCUITestDriver from 'appium-xcuitest-driver';
import AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import type {
  DefaultCreateSessionResult, DriverCaps, DriverData, W3CDriverCaps,
  RouteMatcher
} from '@appium/types';
import type { IsolateSocket } from './sessions/isolate_socket';
import type { Server } from 'node:net';
import type { LogMonitor } from './sessions/log-monitor';


type FluttertDriverConstraints = typeof desiredCapConstraints;
// Need to not proxy in WebView context
const WEBVIEW_NO_PROXY = [
  [`GET`, new RegExp(`^/session/[^/]+/appium`)],
  [`GET`, new RegExp(`^/session/[^/]+/context`)],
  [`GET`, new RegExp(`^/session/[^/]+/element/[^/]+/rect`)],
  [`GET`, new RegExp(`^/session/[^/]+/log/types$`)],
  [`GET`, new RegExp(`^/session/[^/]+/orientation`)],
  [`POST`, new RegExp(`^/session/[^/]+/appium`)],
  [`POST`, new RegExp(`^/session/[^/]+/context`)],
  [`POST`, new RegExp(`^/session/[^/]+/log$`)],
  [`POST`, new RegExp(`^/session/[^/]+/orientation`)],
  [`POST`, new RegExp(`^/session/[^/]+/touch/multi/perform`)],
  [`POST`, new RegExp(`^/session/[^/]+/touch/perform`)],
] as import('@appium/types').RouteMatcher[];

class FlutterDriver extends BaseDriver<FluttertDriverConstraints> {
  public socket: IsolateSocket | null;
  public locatorStrategies = [`key`, `css selector`];
  public proxydriver: XCUITestDriver | AndroidUiautomator2Driver;
  public device: any;

  public portForwardLocalPort: string | null;
  public localServer: Server | null;
  protected _logmon: LogMonitor | null;

  // Used to keep the capabilities internally
  public internalCaps: DriverCaps<FluttertDriverConstraints>;

  public receiveAsyncResponse: (...args: any[]) => Promise<any>;

  // to handle WebView context
  public proxyWebViewActive = false;

  // session
  public executeElementCommand = executeElementCommand;
  public executeGetVMCommand = executeGetVMCommand;
  public executeGetIsolateCommand = executeGetIsolateCommand;
  public execute = execute;
  public executeAsync = execute;

  // element
  public getText = getText;
  public setValue = setValue;
  public clear = clear;
  public getScreenshot = getScreenshot;

  // gesture
  public click = click;
  public longTap = longTap;
  public tapEl = tapEl;
  public tap = tap;
  public performTouch = performTouch;

  // context

  public getContexts = getContexts;
  public getCurrentContext = getCurrentContext;
  public setContext = setContext;
  protected currentContext = FLUTTER_CONTEXT_NAME;
  private driverShouldDoProxyCmd = driverShouldDoProxyCmd;

  // content
  public getClipboard = getClipboard;
  public setClipboard = setClipboard;

  constructor(opts, shouldValidateCaps: boolean) {
    super(opts, shouldValidateCaps);
    this.socket = null;
    this.device = null;
    this._logmon = null;
    this.desiredCapConstraints = desiredCapConstraints;

    // Used to keep the port for port forward to clear the pair.
    this.portForwardLocalPort = null;

    // Used for iOS to end the local server to proxy the request.
    this.localServer = null;
  }

  public async createSession(...args): Promise<DefaultCreateSessionResult<FluttertDriverConstraints>> {
    const [sessionId, caps] = await super.createSession(...JSON.parse(JSON.stringify(args)) as [
      W3CDriverCaps, W3CDriverCaps, W3CDriverCaps, DriverData[]
    ]);
    this.internalCaps = caps;
    return createSession.bind(this)(sessionId, caps, ...JSON.parse(JSON.stringify(args)));
  }

  public async deleteSession() {
    this.log.info(`Deleting Flutter Driver session`);

    this._logmon?.stop();
    this._logmon = null;
    this.proxydriver?.eventEmitter?.removeAllListeners('syslogStarted');

    this.log.info('Cleanup the port forward');
    switch (_.toLower(this.internalCaps.platformName)) {
      case PLATFORM.IOS:
        this.localServer?.close();
        this.localServer = null;
        break;
      case PLATFORM.ANDROID:
        if (this.portForwardLocalPort) {
          await this.proxydriver?.adb?.removePortForward(this.portForwardLocalPort);
        }
        break;
      }

    if (this.proxydriver) {
      this.log.info('Deleting the proxy driver session.');
      try {
        await this.proxydriver.deleteSession();
      } catch (e) {
        this.log.warn(e.message);
      }
      this.proxydriver = null;
    }

    await super.deleteSession();
  }

  public async installApp(appPath: string, opts = {}) {
    this.proxydriver.installApp(appPath, opts);
  }

  public async activateApp(appId: string) {
    this.proxydriver.activateApp(appId);
    await reConnectFlutterDriver.bind(this)(this.internalCaps);
  }

  public async terminateApp(appId: string) {
    return await this.proxydriver.terminateApp(appId);
  }

  public async getOrientation(): Promise<string> {
    return await this.proxydriver.getOrientation();
  }

  public async setOrientation(orientation: string) {
    return await this.proxydriver.setOrientation(orientation);
  }

  public validateLocatorStrategy(strategy: string) {
    // @todo refactor DRY
    if (this.currentContext === `NATIVE_APP`) {
      return this.proxydriver.validateLocatorStrategy(strategy);
    }
    super.validateLocatorStrategy(strategy, false);
  }

  validateDesiredCaps(caps: DriverCaps<FluttertDriverConstraints>): caps is DriverCaps<FluttertDriverConstraints> {
    // check with the base class, and return if it fails
    const res = super.validateDesiredCaps(caps);
    if (!res) {
      return res;
    }

    // finally, return true since the superclass check passed, as did this
    return true;
  }

  public async proxyCommand (url: string, method: string, body = null) {
    const result = await this.proxydriver.proxyCommand(url, method, body);
    return result;
  }

  public async executeCommand(cmd: string, ...args: [string, [{skipAttachObservatoryUrl: string, any: any}]]) {
    if (new RegExp(/^[\s]*mobile:[\s]*activateApp$/).test(args[0])) {
      const { skipAttachObservatoryUrl = false } = args[1][0];
      await this.proxydriver.executeCommand(cmd, ...args);
      if (skipAttachObservatoryUrl) { return; }
      await reConnectFlutterDriver.bind(this)(this.internalCaps);
      return;
    } else if (new RegExp(/^[\s]*mobile:[\s]*terminateApp$/).test(args[0])) {
      // to make the behavior as same as this.terminateApp
      return await this.proxydriver.executeCommand(cmd, ...args);
    } else if (cmd === `receiveAsyncResponse`) {
      logger.debug(`Executing FlutterDriver response '${cmd}'`);
      return await this.receiveAsyncResponse(...args);
    } else {
      if (this.driverShouldDoProxyCmd(cmd)) {
        logger.debug(`Executing proxied driver command '${cmd}'`);

        // There are 2 CommandTimeout (FlutterDriver and proxy)
        // Only FlutterDriver CommandTimeout is used; Proxy is disabled
        // All proxy commands needs to reset the FlutterDriver CommandTimeout
        // Here we manually reset the FlutterDriver CommandTimeout for commands that goes to proxy.
        this.clearNewCommandTimeout();
        const result = await this.proxydriver.executeCommand(cmd, ...args);
        this.startNewCommandTimeout();
        return result;
      } else {
        logger.debug(`Executing Flutter driver command '${cmd}'`);
        return await super.executeCommand(cmd, ...args);
      }
    }
  }

  public getProxyAvoidList(): RouteMatcher[] {
    if ([FLUTTER_CONTEXT_NAME, NATIVE_CONTEXT_NAME].includes(this.currentContext)) {
      return [];
    }

    return WEBVIEW_NO_PROXY;
  }

  public proxyActive(): boolean {
    // In WebView context, all request should got to each driver
    // so that they can handle http request properly.
    // On iOS, WebView context is handled by XCUITest driver while Android is by chromedriver.
    // It means XCUITest driver should keep the XCUITest driver as a proxy,
    // while UIAutomator2 driver should proxy to chromedriver instead of UIA2 proxy.
    return this.proxyWebViewActive && this.proxydriver.constructor.name !== XCUITestDriver.name;
  }

  public canProxy(): boolean {
    // As same as proxyActive, all request should got to each driver
    // so that they can handle http request properly
    return this.proxyWebViewActive;
  }
}

export { FlutterDriver };
