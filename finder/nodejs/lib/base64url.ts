const W3C_ELEMENT: string = `element-6066-11e4-a52e-4f735466cecf`;
const MJSON_ELEMENT: string = `ELEMENT`;

export const encode = (input: string) =>
  Buffer.from(input)
    .toString(`base64`)
    .replace(/=/g, ``)
    .replace(/\+/g, `-`)
    .replace(/\//g, `_`);

export const decode = (input: string | {[key: string]: string}) => {
  let base64String: string = ``;
  if (typeof input === `string`) {
    base64String = input;
  } else if (typeof input === `object` && W3C_ELEMENT in input) {
    base64String = input[W3C_ELEMENT];
  } else if (typeof input === `object` && MJSON_ELEMENT in input) {
    base64String = input[MJSON_ELEMENT];
  } else {
    throw new Error(`input is invalid ${JSON.stringify(input)}`);
  }
  return Buffer.from(base64String, `base64`).toString();
};
