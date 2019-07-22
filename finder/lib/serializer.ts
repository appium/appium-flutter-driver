// @todo consider using protobuf
function serialize(obj: object) {
  return Buffer.from(JSON.stringify(obj)).toString(`base64`);
}

export const byValueKey = (key: string | number) =>
  serialize({
    finderType: `ByValueKey`,
    keyValueString: key,
    // @todo is `int` correct?
    keyValueType: typeof key === `string` ? `String` : `int`,
  });
