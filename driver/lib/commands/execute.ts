import { FlutterDriver } from '../driver';
const flutterCommandRegex = /^[\s]*flutter[\s]*:(.+)/;

export const execute = async function(
  this: FlutterDriver,
  rawCommand: string,
  args: any[],
) {
  // flutter
  const matching = rawCommand.match(flutterCommandRegex);
  if (!matching) {
    throw new Error(`Command not support: "${rawCommand}"`);
  }

  const command = matching[1].trim();
  switch (command) {
    case `getRenderTree`:
      return getRenderTree(this);
    case `getBottomLeft`:
      return getOffset(this, args[0], { offsetType: `bottomLeft` });
    case `getBottomRight`:
      return getOffset(this, args[0], { offsetType: `bottomRight` });
    case `getCenter`:
      return getOffset(this, args[0], { offsetType: `center` });
    case `getTopLeft`:
      return getOffset(this, args[0], { offsetType: `topLeft` });
    case `getTopRight`:
      return getOffset(this, args[0], { offsetType: `topRight` });
    default:
      throw new Error(`Command not support: "${rawCommand}"`);
  }
};

const getRenderTree = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_render_tree`)).tree;

const getOffset = async (
  self: FlutterDriver,
  elementBase64: string,
  offsetType,
) => await self.executeElementCommand(`get_offset`, elementBase64, offsetType);
