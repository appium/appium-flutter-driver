import _ from 'lodash';
import { util } from '@appium/support';

export const decode = (input: string | {ELEMENT: string} | {[util.W3C_WEB_ELEMENT_IDENTIFIER]: string}): string => {
  let base64String: string = ``;
  if (_.isString(input)) {
    base64String = input;
  } else if (_.has(input, util.W3C_WEB_ELEMENT_IDENTIFIER)) {
    base64String = input[util.W3C_WEB_ELEMENT_IDENTIFIER] as string;
  } else if (_.has(input, 'ELEMENT')) {
    base64String = input.ELEMENT as string;
  } else {
    throw new Error(
      `Input is is expceted to be a base64-encoded string or a valid element object. ` +
      `${JSON.stringify(input)} has been provided instead`);
  }
  return Buffer.from(base64String, `base64`).toString();
};
