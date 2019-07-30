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
    case `checkHealth`:
      return checkHealth(this);
    case `clearTimeline`:
      return clearTimeline(this);
    case `forceGC`:
      return forceGC(this);
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
    case `getRenderObjectDiagnostics`:
      return getRenderObjectDiagnostics(this, args[0], args[1]);
    case `getSemanticsId`:
      return getSemanticsId(this, args[0]);
    default:
      throw new Error(`Command not support: "${rawCommand}"`);
  }
};

const checkHealth = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_health`)).status;

const getRenderTree = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_render_tree`)).tree;

const getOffset = async (
  self: FlutterDriver,
  elementBase64: string,
  offsetType,
) => await self.executeElementCommand(`get_offset`, elementBase64, offsetType);

const forceGC = async (self: FlutterDriver) => {
  const response = await self.socket.call(`_collectAllGarbage`, {
    isolateId: self.socket.isolateId,
  });
  if (response.type !== `Success`) {
    throw new Error(`Could not forceGC, reponse was ${response}`);
  }
};

const clearTimeline = async (self: FlutterDriver) => {
  const response = await self.socket.call(`_clearVMTimeline`);
  if (response.type !== `Success`) {
    throw new Error(`Could not forceGC, reponse was ${response}`);
  }
};

const getRenderObjectDiagnostics = async (
  self: FlutterDriver,
  elementBase64: string,
  opts: {
    subtreeDepth: number;
    includeProperties: boolean;
  },
) => {
  const subtreeDepth = opts.subtreeDepth || 0;
  const includeProperties = opts.includeProperties || true;

  return await self.executeElementCommand(
    `get_diagnostics_tree`,
    elementBase64,
    {
      diagnosticsType: `renderObject`,
      includeProperties,
      subtreeDepth,
    },
  );
};

const getSemanticsId = async (self: FlutterDriver, elementBase64: string) =>
  (await self.executeElementCommand(`get_semantics_id`, elementBase64)).id;
