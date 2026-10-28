import type {FlutterDriver} from '../driver.js';
import {reConnectFlutterDriver} from './session.js';

/** Preserve VM service logs emitted during launch, optionally reusing a running app's URL. */
export async function reconnectAfterAppLaunch(
  this: FlutterDriver,
  launchFn: () => Promise<void>,
  allowExistingSession = false,
) {
  const previousMatch = this._logmon?.lastMatch ?? null;
  this._logmon?.reset();
  await launchFn();
  if (allowExistingSession && this._logmon && !this._logmon.lastMatch && previousMatch) {
    this._logmon.restoreLastMatch(previousMatch);
    try {
      await reConnectFlutterDriver.bind(this)(this.internalCaps, false);
      return;
    } catch (e) {
      this.log.debug(
        `Previous observatory URL is no longer reachable after app activation (${(e as Error).message}); ` +
          `waiting for a new observatory URL in device logs`,
      );
      if (this._logmon.lastMatch === previousMatch) {
        this._logmon.clearlastMatch();
      }
    }
  }
  await reConnectFlutterDriver.bind(this)(this.internalCaps, false);
}
