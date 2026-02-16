import type { FlutterDriver } from "../driver";
import { IsolateSocket } from "../sessions/isolate_socket";

export const getScreenshot = async function (this: FlutterDriver) {
  const response = (await (this.socket as IsolateSocket).call(
    `_flutter.screenshot`,
  )) as any;
  return response.screenshot;
};
