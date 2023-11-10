import type { FlutterDriver } from '../driver';

export const getScreenshot = async function(this: FlutterDriver) {
  const response = await this.socket!.call(`_flutter.screenshot`) as any;
  return response.screenshot;
};
