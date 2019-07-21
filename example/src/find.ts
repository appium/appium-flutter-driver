function serialize(obj: Object) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

export const find = {
  byValueKey(key: string | number) {
    return serialize({
      finderType: 'ByValueKey',
      keyValueString: key,
      keyValueType: typeof key === 'string' ? 'String' : 'int'
    });
  }
};
