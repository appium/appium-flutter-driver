import { FlutterDriver } from '../driver';

export const getText = async function(this: FlutterDriver, el: string) {
  const response = await this.executeElementCommand(`get_text`, el);
  return response.text;
};
