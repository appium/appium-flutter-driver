import _ from 'lodash';
import { util } from '@appium/support';

export const decode = (input: string | {ELEMENT: string}): string => {
  let base64String = ``;
  if (_.isString(input)) {
    base64String = input;
  } else if (_.has(input, util.W3C_WEB_ELEMENT_IDENTIFIER)) {
    base64String = input[util.W3C_WEB_ELEMENT_IDENTIFIER];
  } else if (_.has(input, 'ELEMENT')) {
    base64String = input.ELEMENT;
  } else {
    throw new Error(
      `Input is is expceted to be a base64-encoded string or a valid element object. ` +
      `${JSON.stringify(input)} has been provided instead`);
  }
  return Buffer.from(base64String, `base64`).toString();
};
