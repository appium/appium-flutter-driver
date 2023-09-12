const W3C_ELEMENT = `element-6066-11e4-a52e-4f735466cecf`;

export const decode = (input: string | {ELEMENT: string}): string => {
  let base64String = ``;
  if (typeof input === `string`) {
    base64String = input;
  } else if (typeof input === `object` && input[W3C_ELEMENT]) {
    base64String = input[W3C_ELEMENT];
  } else if (typeof input === `object` && input.ELEMENT) {
    base64String = input.ELEMENT;
  } else {
    throw new Error(`input is invalid ${JSON.stringify(input)}`);
  }
  return Buffer.from(base64String, `base64`).toString();
};
