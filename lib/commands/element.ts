import { FlutterDriver } from '../driver';

export const getText = async function(this: FlutterDriver, el: string): Promise<string|null> {
  const response = await this.executeElementCommand(`get_text`, el);
  return response.text;
};

export const setValue = async function(this: FlutterDriver, textInput: string | [string], el: string) {
  const clickPromise = this.click(el); // acquire focus
  let text = ``;
  if (textInput instanceof Array) {
    text = textInput.reduce((previousValue, currentValue) => `${previousValue}${currentValue}`);
  } else if (typeof textInput === `string`) {
    text = textInput;
  } else {
    throw new Error(`Invalid textInput: ${textInput}`);
  }
  await clickPromise;
  await this.execute(`flutter:enterText`, [text]);
};

export const clear = async function(this: FlutterDriver, el: string) {
  await this.setValue([``], el);
};
