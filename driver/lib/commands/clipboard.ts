import type { FlutterDriver } from '../driver';

/**
 * Set clipboard content via each native app driver
 * @param this the FlutterDriver
 * @param content the content to get the clipboard
 * @param contentType the contentType to set the data type
 */
export const setClipboard = async function(this: FlutterDriver, content: string, contentType: string) {
  // @ts-expect-error this exist in xcuitestdriver or uia2 driver
  await this.proxydriver?.setClipboard(content, contentType);
};


/**
 * Get the clipboard content via each native app driver
 * @param this the FlutterDriver
 * @param contentType the contentType to set the data type
 */
export const getClipboard = async function(this: FlutterDriver, contentType: string) {
  // @ts-expect-error this exist in xcuitestdriver or uia2 driver
  await this.proxydriver?.getClipboard(contentType);
};
