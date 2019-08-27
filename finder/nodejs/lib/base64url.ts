export const encode = (input: string) =>
  Buffer.from(input)
    .toString(`base64`)
    .replace(/=/g, ``)
    .replace(/\+/g, `-`)
    .replace(/\//g, `_`);

export const decode = (input: string | {ELEMENT: string}) => {
  let base64String: string = ``;
  if (typeof input === `string`) {
    base64String = input;
  } else if (typeof input === `object` && input.ELEMENT) {
    base64String = input.ELEMENT;
  } else {
    throw new Error(`input is invalid ${JSON.stringify(input)}`);
  }
  return Buffer.from(base64String, `base64`).toString();
};
