import { FlutterDriver } from '../driver';

export const FLUTTER_CONTEXT_NAME = `FLUTTER`;

export const getCurrentContext = function(this: FlutterDriver) {
  return this.currentContext;
};

export const setContext = async function(this: FlutterDriver, context: string) {
  if ([FLUTTER_CONTEXT_NAME, `NATIVE_APP`].includes(context)) {
    // Set 'native context' when flutter driver sets the context to FLUTTER_CONTEXT_NAME
    if (this.proxydriver) {
      await this.proxydriver.setContext(`NATIVE_APP`);
    }
  } else {
    // this case may be 'webview'
    if (this.proxydriver) {
      await this.proxydriver.setContext(context);
      this.proxyReqRes = this.proxydriver.proxyReqRes.bind(this.proxydriver.chromedriver);
      this.isProxyActive = true;

    }
  }
  this.currentContext = context;
};

export const getContexts = async function(this: FlutterDriver) {
  const nativeContext = await this.proxydriver.getContexts();
  return [...nativeContext, FLUTTER_CONTEXT_NAME];
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

  return true;
};
