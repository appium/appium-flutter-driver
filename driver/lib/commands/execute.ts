import { FlutterDriver } from '../driver';
import { executeSocketCommand } from '../sessions/observatory';
import { longTap, scroll, scrollIntoView, scrollUntilVisible } from './execute/scroll';
import { waitFor, waitForAbsent } from './execute/wait';
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
    case `waitForAbsent`:
      return waitForAbsent(this, args[0], args[1]);
    case `waitFor`:
      return waitFor(this, args[0], args[1]);
    case `scroll`:
      return scroll(this, args[0], args[1]);
    case `scrollUntilVisible`:
      return scrollUntilVisible(this, args[0], args[1]);
    case `scrollIntoView`:
      return scrollIntoView(this, args[0], args[1]);
    case `enterText`:
      return enterText(this, args[0]);
    case `longTap`:
      return longTap(this, args[0], args[1]);
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

const anyPromise = (promises: Array<Promise<any>>) => {
  const newpArray = promises.map((p) =>
    p.then(
      (resolvedValue) => Promise.reject(resolvedValue),
      (rejectedReason) => rejectedReason,
    ),
  );
  return Promise.all(newpArray).then(
    (rejectedReasons) => Promise.reject(rejectedReasons),
    (resolvedValue) => resolvedValue,
  );
};

const clearTimeline = async (self: FlutterDriver) => {
  // @todo backward compatible, need to cleanup later
  const call1: Promise<any> = self.socket.call(`_clearVMTimeline`);
  const call2: Promise<any> = self.socket.call(`clearVMTimeline`);
  const response = await anyPromise([call1, call2]);
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
  const { subtreeDepth = 0, includeProperties = true } = opts;

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

const enterText = async (self: FlutterDriver, text: string) =>
  await executeSocketCommand(self.socket, { command: `enter_text`, text });
