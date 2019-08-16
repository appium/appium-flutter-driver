// @ts-ignore
import { BaseDriver, errors } from 'appium-base-driver';

import { desiredCapConstraints, IDesiredCapConstraints } from './desired-caps';
import { log as logger } from './logger';

import { executeElementCommand } from './sessions/observatory';
import { createSession, deleteSession } from './sessions/session';

import { driverShouldDoProxyCmd, FLUTTER_CONTEXT_NAME,
  getContexts, getCurrentContext, setContext } from './commands/context';
import { getText } from './commands/element';
import { execute } from './commands/execute';
import { click, performTouch, tap, tapEl } from './commands/gesture';
import { getScreenshot } from './commands/screen';

class FlutterDriver extends BaseDriver {
  public desiredCapConstraints: IDesiredCapConstraints;
  public socket: any;
  public locatorStrategies = [`key`, `css selector`];
  public proxydriver: any;
  public device: any;

  // from BaseDriver
  public opts: any;
  public caps: any;
  public clearNewCommandTimeout: any;
  public startNewCommandTimeout: any;
  public receiveAsyncResponse: any;

  // session
  public executeElementCommand = executeElementCommand;
  public execute = execute;
  public executeAsync = execute;

  // element
  public getText = getText;
  public getScreenshot = getScreenshot;

  // gesture
  public click = click;
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

    this.desiredCapConstraints = desiredCapConstraints;

    this.socket = null;
    this.proxydriver = null;
    this.device = null;
  }

  public async createSession(caps: IDesiredCapConstraints) {
    const [sessionId] = await super.createSession(caps);
    return createSession.bind(this)(caps, sessionId);
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
    // @ts-ignore
    if (caps.deviceName.toLowerCase() === `android`) {
      if (!caps.avd) {
        const msg = `The desired capabilities must include avd`;
        logger.errorAndThrow(msg);
      }
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

}

export { FlutterDriver };
