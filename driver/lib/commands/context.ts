import type { FlutterDriver } from '../driver';

export const FLUTTER_CONTEXT_NAME = `FLUTTER`;
export const NATIVE_CONTEXT_NAME = `NATIVE_APP`;

export const getCurrentContext = async function(this: FlutterDriver): Promise<string> {
  return this.currentContext;
};

export const setContext = async function(this: FlutterDriver, context: string) {
  if ([FLUTTER_CONTEXT_NAME, NATIVE_CONTEXT_NAME].includes(context)) {
    this.proxyWebViewActive = false;
    // Set 'native context' when flutter driver sets the context to FLUTTER_CONTEXT_NAME
    if (this.proxydriver) {
      await this.proxydriver.setContext(NATIVE_CONTEXT_NAME);
    }
  } else {
    // this case may be 'webview'
    if (this.proxydriver) {
      await this.proxydriver.setContext(context);
      this.proxyWebViewActive = true;
    }
  }
  this.currentContext = context;
};

export const getContexts = async function(this: FlutterDriver): Promise<string[]> {
  const nativeContext = await this.proxydriver.getContexts();
  return [...nativeContext, FLUTTER_CONTEXT_NAME];
};

export const driverShouldDoProxyCmd = function(this: FlutterDriver, command: string): boolean {
  if (!this.proxydriver) {
    return false;
  }

  if (this.currentContext === FLUTTER_CONTEXT_NAME) {
    return false;
  }

  if ([`getCurrentContext`, `setContext`, `getContexts`].includes(command)) {
    return false;
  }

  return true;
};
