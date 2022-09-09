// @ts-ignore: no 'errors' export module
import { BaseDriver, errors } from 'appium/driver';
import { W3CCapabilities, Capabilities, DriverData } from '@appium/types';
import { IsolateSocket } from './sessions/isolate_socket';

import { log as logger } from './logger';

import { DRIVER_NAME as IOS_DEVICE_NAME } from './sessions/ios';
import { executeElementCommand, executeGetVMCommand,
  executeGetIsolateCommand } from './sessions/observatory';
import { createSession, deleteSession } from './sessions/session';

import { driverShouldDoProxyCmd, FLUTTER_CONTEXT_NAME,
  getContexts, getCurrentContext, NATIVE_CONTEXT_NAME, setContext } from './commands/context';
import { clear, getText, setValue } from './commands/element';
import { execute } from './commands/execute';
import { click, longTap, performTouch, tap, tapEl } from './commands/gesture';
import { getScreenshot } from './commands/screen';

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

class FlutterDriver extends BaseDriver {
  public socket: IsolateSocket | null = null;
  public locatorStrategies = [`key`, `css selector`];
  public proxydriver: any;
  public proxydriverName: string;  // to store 'driver name' as proxy to.
  public device: any;

  // from BaseDriver
  public opts: any;
  public caps: any;
  public clearNewCommandTimeout: any;
  public startNewCommandTimeout: any;
  public receiveAsyncResponse: any;
  public relaxedSecurityEnabled: any;
  public denyInsecure: any;
  public allowInsecure: any;

  // to handle WebView context
  public proxyWebViewActive: boolean = false;

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

  constructor(opts, shouldValidateCaps: boolean) {
    super(opts, shouldValidateCaps);
    this.proxydriver = null;
    this.proxydriverName = ``;
    this.device = null;
  }

  public async createSession(...args): Promise<[string, {}]> {
    const [sessionId, caps] = await super.createSession(...JSON.parse(JSON.stringify(args)) as [W3CCapabilities, W3CCapabilities, W3CCapabilities, DriverData[]]);
    return createSession.bind(this)(sessionId, caps, ...JSON.parse(JSON.stringify(args))) as Promise<[string, {}]>;  // @ts-ignore
  }

  public async deleteSession() {
    await Promise.all([
      deleteSession.bind(this)(),
      super.deleteSession(),
    ]);
  }

  public validateLocatorStrategy(strategy: string) {
    // @todo refactor DRY
    if (this.currentContext === `NATIVE_APP`) {
      return this.proxydriver.validateLocatorStrategy(strategy);
    }
    super.validateLocatorStrategy(strategy, false);
  }

  public validateDesiredCaps(caps: Capabilities) {
    // check with the base class, and return if it fails
    const res = super.validateDesiredCaps(caps);
    if (!res) {
      return res;
    }

    // finally, return true since the superclass check passed, as did this
    return true;
  }

  public async executeCommand(cmd: string, ...args: any[]) {
    if (cmd === `receiveAsyncResponse`) {
      logger.debug(`Executing FlutterDriver response '${cmd}'`);
      return await this.receiveAsyncResponse(...args);
    } else if (this.socket) {
      if (this.driverShouldDoProxyCmd(cmd)) {
        logger.debug(`Executing proxied driver command '${cmd}'`);

        // There are 2 CommandTimeout (FlutterDriver and proxy)
        // Only FlutterDriver CommandTimeout is used; Proxy is disabled
        // All proxy commands needs to reset the FlutterDriver CommandTimeout
        // Here we manually reset the FlutterDriver CommandTimeout for commands that goe to proxy.
        this.clearNewCommandTimeout();
        const result = await this.proxydriver.executeCommand(cmd, ...args);
        this.startNewCommandTimeout(cmd);
        return result;
      } else {
        logger.debug(`Executing Flutter driver command '${cmd}'`);
        return await super.executeCommand(cmd, ...args);
      }
    } else {
      logger.debug(`Command Error '${cmd}'`);
      throw new errors.NoSuchDriverError(
        `Driver is not ready, cannot execute ${cmd}.`,
      );
    }
  }

  public getProxyAvoidList(): import('@appium/types').RouteMatcher[] {
    if ([FLUTTER_CONTEXT_NAME, NATIVE_CONTEXT_NAME].includes(this.currentContext)) {
      return [];
    }

    return WEBVIEW_NO_PROXY;
  }

  public proxyActive() {
    // In WebView context, all request should got to each driver
    // so that they can handle http request properly.
    // On iOS, WebVie context is handled by XCUITest driver while Android is by chromedriver.
    // It means XCUITest driver should keep the XCUITest driver as a proxy,
    // while UIAutomator2 driver should proxy to chromedriver instead of UIA2 proxy.
    return this.proxyWebViewActive && this.proxydriverName !== IOS_DEVICE_NAME;
  }

  public canProxy() {
    // As same as proxyActive, all request should got to each driver
    // so that they can handle http request properly
    return this.proxyWebViewActive;
  }
}

export { FlutterDriver };
