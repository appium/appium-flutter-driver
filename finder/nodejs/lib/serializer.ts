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
  firstMatchOnly?: boolean;
}) => {
  const { of, matching, matchRoot = false, firstMatchOnly = false} = args;
  const a: any = {
    finderType: `Ancestor`,
    firstMatchOnly: `${firstMatchOnly}`,
    matchRoot: `${matchRoot}`,
  };
  const ofParam: any = {};
  Object.entries(deserialize(of)).forEach(
    ([key, value]) => (ofParam[key] = value),
  );
  a[`of`] = JSON.stringify(ofParam);

  const matchingPara: any = {};
  Object.entries(deserialize(matching)).forEach(
    ([key, value]) => (matchingPara[key] = value),
  );
  a[`matching`] = JSON.stringify(matchingPara);

  return serialize(a);
};

export const bySemanticsLabel = (label: Pattern) =>
  serialize({
    finderType: `BySemanticsLabel`,
    isRegExp: label instanceof RegExp ? true : false,
    label: label instanceof RegExp ? label.toString().slice(1, -1) : label,
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
  matchRoot?: boolean;
  firstMatchOnly?: boolean;
}) => {
  const { of, matching, matchRoot = false , firstMatchOnly = false} = args;
  const a: any = {
    finderType: `Descendant`,
    firstMatchOnly: `${firstMatchOnly}`,
    matchRoot: `${matchRoot}`,
  };
  const ofParam: any = {};
  Object.entries(deserialize(of)).forEach(
    ([key, value]) => (ofParam[key] = value),
  );
  a[`of`] = JSON.stringify(ofParam);

  const matchingParam: any = {};
  Object.entries(deserialize(matching)).forEach(
    ([key, value]) => (matchingParam[key] = value),
  );
  a[`matching`] = JSON.stringify(matchingParam);

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
