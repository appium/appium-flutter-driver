import { FlutterDriver } from '../driver';
import { longTap, scroll, scrollIntoView, scrollUntilVisible, scrollUntilTapable } from './execute/scroll';
import { waitFor, waitForAbsent, waitForTappable } from './execute/wait';
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
    case `getVMInfo`:
      return getVMInfo(this);
    case `setIsolateId`:
      return setIsolateId(this, args[0])
    case `getIsolate`:
      return getIsolate(this, args[0])
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
    case `waitForTappable`:
      return waitForTappable(this, args[0], args[1]);
    case `scroll`:
      return scroll(this, args[0], args[1]);
    case `scrollUntilVisible`:
      return scrollUntilVisible(this, args[0], args[1]);
    case `scrollUntilTapable`:
      return scrollUntilTapable(this, args[0], args[1]);
    case `scrollIntoView`:
      return scrollIntoView(this, args[0], args[1]);
    case `setTextEntryEmulation`:
      return setTextEntryEmulation(this, args[0]);
    case `enterText`:
      return enterText(this, args[0]);
    case `requestData`:
      return requestData(this, args[0]);
    case `longTap`:
      return longTap(this, args[0], args[1]);
    case `waitForFirstFrame`:
      return waitForCondition(this, { conditionName : `FirstFrameRasterizedCondition`});
    case `setFrameSync`:
      return setFrameSync(this, args[0], args[1]);
    default:
      throw new Error(`Command not support: "${rawCommand}"`);
  }
};

const checkHealth = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_health`)).status;

const getVMInfo =async (self: FlutterDriver) =>
  (await self.executeGetVMCommand());

const getRenderTree = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_render_tree`)).tree;

const getOffset = async (
  self: FlutterDriver,
  elementBase64: string,
  offsetType,
) => await self.executeElementCommand(`get_offset`, elementBase64, offsetType);

const waitForCondition = async (
  self: FlutterDriver,
  conditionName,
) => await self.executeElementCommand(`waitForCondition`, ``, conditionName);

const forceGC = async (self: FlutterDriver) => {
  const response = await self.socket!.call(`_collectAllGarbage`, {
    isolateId: self.socket!.isolateId,
  }) as { type: string };
  if (response.type !== `Success`) {
    throw new Error(`Could not forceGC, response was ${response}`);
  }
};

const setIsolateId = async (self: FlutterDriver, isolateId: string) => {
  self.socket!.isolateId = isolateId;
  return await self.socket!.call(`getIsolate`, {
    isolateId: `${isolateId}`,
  });
};

const getIsolate = async (self: FlutterDriver, isolateId: string|undefined) => {
  return await self.executeGetIsolateCommand(isolateId || self.socket!.isolateId);
}

const anyPromise = (promises: Promise<any>[]) => {
  const newArray = promises.map((p) =>
    p.then(
      (resolvedValue) => Promise.reject(resolvedValue),
      (rejectedReason) => rejectedReason,
    ),
  );
  return Promise.all(newArray).then(
    (rejectedReasons) => Promise.reject(rejectedReasons),
    (resolvedValue) => resolvedValue,
  );
};

const clearTimeline = async (self: FlutterDriver) => {
  // @todo backward compatible, need to cleanup later
  const call1: Promise<any> = self.socket!.call(`_clearVMTimeline`);
  const call2: Promise<any> = self.socket!.call(`clearVMTimeline`);
  const response = await anyPromise([call1, call2]);
  if (response.type !== `Success`) {
    throw new Error(`Could not forceGC, response was ${response}`);
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
  await self.socket!.executeSocketCommand({ command: `enter_text`, text });

const requestData = async (self: FlutterDriver, message: string) =>
  await self.socket!.executeSocketCommand({ command: `request_data`, message });

const setFrameSync = async (self, bool, durationMilliseconds) =>
  await self.socket!.executeSocketCommand({
    command: `set_frame_sync`,
    enabled: bool,
    timeout: durationMilliseconds,
  });

const setTextEntryEmulation = async (self: FlutterDriver, enabled: boolean) =>
  await self.socket!.executeSocketCommand({ command: `set_text_entry_emulation`, enabled });
