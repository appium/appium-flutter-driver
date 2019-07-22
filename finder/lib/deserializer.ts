// @todo consider using protobuf
export const deserialize = (base64String: string) =>
  JSON.parse(Buffer.from(base64String, `base64`).toString());
