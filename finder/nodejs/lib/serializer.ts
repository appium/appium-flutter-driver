import { encode } from './base64url';
import { deserialize } from './deserializer';

// @todo consider using protobuf
function serialize(obj: object) {
  return encode(JSON.stringify(obj));
}

export type SerializableFinder = string;
export type Pattern = string | RegExp;

export const ancestor = (args: {
  of: SerializableFinder;
  matching: SerializableFinder;
  matchRoot?: boolean;
}) => {
  const { of, matching, matchRoot = false } = args;
  const a: any = {
    finderType: `Ancestor`,
    matchRoot,
  };
  Object.entries(deserialize(of)).forEach(
    ([key, value]) => (a[`of_${key}`] = value),
  );
  Object.entries(deserialize(matching)).forEach(
    ([key, value]) => (a[`matching_${key}`] = value),
  );
  return serialize(a);
};

export const bySemanticsLabel = (label: Pattern) =>
  serialize({
    finderType: `BySemanticsLabel`,
    isRegExp: label instanceof RegExp ? true : false,
    label: label.toString().slice(1, -1),
  });

export const byTooltip = (text: string) =>
  serialize({
    finderType: `ByTooltipMessage`,
    text,
  });

export const byType = (type: string) =>
  serialize({
    finderType: `ByType`,
    type,
  });

export const byValueKey = (key: string | number) =>
  serialize({
    finderType: `ByValueKey`,
    keyValueString: key,
    keyValueType: typeof key === `string` ? `String` : `int`,
  });

export const descendant = (args: {
  of: SerializableFinder;
  matching: SerializableFinder;
  matchRoot: boolean;
}) => {
  const { of, matching, matchRoot = false } = args;
  const a: any = {
    finderType: `Descendant`,
    matchRoot,
  };
  Object.entries(deserialize(of)).forEach(
    ([key, value]) => (a[`of_${key}`] = value),
  );
  Object.entries(deserialize(matching)).forEach(
    ([key, value]) => (a[`matching_${key}`] = value),
  );
  return serialize(a);
};

export const pageBack = () =>
  serialize({
    finderType: `PageBack`,
  });

export const byText = (text: string) =>
  serialize({
    finderType: `ByText`,
    text,
  });
