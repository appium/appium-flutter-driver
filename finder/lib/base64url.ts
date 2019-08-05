export const encode = (input: string) =>
  Buffer.from(input)
    .toString(`base64`)
    .replace(/=/g, ``)
    .replace(/\+/g, `-`)
    .replace(/\//g, `_`);

export const decode = (base64String: string) =>
  Buffer.from(base64String, `base64`).toString();
