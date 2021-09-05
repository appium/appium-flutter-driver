import { BaseDriver, errors } from 'appium-base-driver';
import { IsolateSocket } from './sessions/isolate_socket';

import { IDesiredCapConstraints } from './desired-caps';
import { log as logger } from './logger';

import { executeElementCommand } from './sessions/observatory';
import { createSession, deleteSession } from './sessions/session';

import { driverShouldDoProxyCmd, FLUTTER_CONTEXT_NAME,
  getContexts, getCurrentContext, setContext } from './commands/context';
import { clear, getText, setValue } from './commands/element';
import { execute } from './commands/execute';
import { click, longTap, performTouch, tap, tapEl } from './commands/gesture';
import { getScreenshot } from './commands/screen';

// Need to not proxy in WebView context
const WEBVIEW_NO_PROXY = [
  ['GET', new RegExp('^/session/[^/]+/appium')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/rect')],
  ['GET', new RegExp('^/session/[^/]+/log/types$')],
  ['GET', new RegExp('^/session/[^/]+/orientation')],
  ['POST', new RegExp('^/session/[^/]+/appium')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/log$')],
  ['POST', new RegExp('^/session/[^/]+/orientation')],
  ['POST', new RegExp('^/session/[^/]+/touch/multi/perform')],
  ['POST', new RegExp('^/session/[^/]+/touch/perform')],
];

class FlutterDriver extends BaseDriver {
  public socket: IsolateSocket | null = null;
  public locatorStrategies = [`key`, `css selector`];
  public proxydriver: any;
  public device: any;

  // from BaseDriver
  public opts: any;
  public caps: any;
  public clearNewCommandTimeout: any;
  public startNewCommandTimeout: any;
  public receiveAsyncResponse: any;
  public proxyReqRes: any;
  public proxyWebViewActive = false;

  // session
  public executeElementCommand = executeElementCommand;
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
    this.device = null;
  }

  public async createSession(...args) {
    const [sessionId, caps] = await super.createSession(...JSON.parse(JSON.stringify(args)));
    return createSession.bind(this)(sessionId, caps, ...JSON.parse(JSON.stringify(args)));
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

  public validateDesiredCaps(caps: IDesiredCapConstraints) {
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
        const result = this.proxydriver.executeCommand(cmd, ...args);
        this.startNewCommandTimeout(cmd);
        return result;
      } else {
        logger.debug(`Executing Flutter driver command '${cmd}'`);
        return super.executeCommand(cmd, ...args);
      }
    } else {
      logger.debug(`Command Error '${cmd}'`);
      throw new errors.NoSuchDriverError(
        `Driver is not ready, cannot execute ${cmd}.`,
      );
    }
  }

  public getProxyAvoidList (sessionId) {
    if ([FLUTTER_CONTEXT_NAME, `NATIVE_APP`].includes(this.currentContext)) {
      return;
    }

    return WEBVIEW_NO_PROXY;
  }

  public proxyActive (sessionId) {
    // In WebView context, all request should got to each driver
    // so that they can handle http request properly
    return this.proxyWebViewActive;
  }

  public canProxy (sessionId) {
    // As same as proxyActive, all request should got to each driver
    // so that they can handle http request properly
    return this.proxyWebViewActive;
  }
}

export { FlutterDriver };
