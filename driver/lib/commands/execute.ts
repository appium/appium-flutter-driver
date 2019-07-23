import { FlutterDriver } from '../driver';
const flutterCommandRegex = /^[\s]*flutter[\s]*:(.+)/;

export const execute = async function(
  this: FlutterDriver,
  rawCommand: string,
  args: any,
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
    default:
      throw new Error(`Command not support: "${rawCommand}"`);
  }
};

const getRenderTree = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_render_tree`)).tree;
