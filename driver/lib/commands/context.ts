import { FlutterDriver } from '../driver';

export const FLUTTER_CONTEXT_NAME = `FLUTTER`;

export const getCurrentContext = function(this: FlutterDriver) {
  return this.currentContext;
};

export const setContext = function(this: FlutterDriver, context: string) {
  return (this.currentContext = context);
};

export const getContexts = async function(this: FlutterDriver) {
  const nativeContext = await this.proxydriver.getContexts();
  this.contexts = [...nativeContext, FLUTTER_CONTEXT_NAME];
  return this.contexts;
};

export const driverShouldDoProxyCmd = function(this: FlutterDriver, command) {
  if (!this.proxydriver) {
    return false;
  }

  if (this.currentContext === FLUTTER_CONTEXT_NAME) {
    return false;
  }

  // @todo what if we want to switch to webview of Native?
  if ([`getCurrentContext`, `setContext`, `getContexts`].includes(command)) {
    return false;
  }

  if (!this.proxydriver[command]) {
    return false;
  }

  return true;
};
