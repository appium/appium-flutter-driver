import {decode} from './base64url.js';
// @todo consider using protobuf
export const deserialize = (base64String: string) => JSON.parse(decode(base64String));
