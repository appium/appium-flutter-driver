/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { FlutterDriver } from '../driver';
import { reConnectFlutterDriver } from '../sessions/session';
import { longTap, scroll, scrollIntoView, scrollUntilVisible, scrollUntilTapable } from './execute/scroll';
import { waitFor, waitForAbsent, waitForTappable } from './execute/wait';
import { launchApp } from './../ios/app';
import B from 'bluebird';


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
    case `launchApp`:
      return await flutterLaunchApp(this, args[0], args[1]);
    case `connectObservatoryWsUrl`:
      return await connectObservatoryWsUrl(this);
    case `getVMInfo`:
      return await getVMInfo(this);
    case `setIsolateId`:
      return await setIsolateId(this, args[0]);
    case `getIsolate`:
      return await getIsolate(this, args[0]);
    case `checkHealth`:
      return await checkHealth(this);
    case `clearTimeline`:
      return await clearTimeline(this);
    case `forceGC`:
      return await forceGC(this);
    case `getRenderTree`:
      return await getRenderTree(this);
    case `getBottomLeft`:
      return await getOffset(this, args[0], { offsetType: `bottomLeft` });
    case `getBottomRight`:
      return await getOffset(this, args[0], { offsetType: `bottomRight` });
    case `getCenter`:
      return await getOffset(this, args[0], { offsetType: `center` });
    case `getTopLeft`:
      return await getOffset(this, args[0], { offsetType: `topLeft` });
    case `getTopRight`:
      return await getOffset(this, args[0], { offsetType: `topRight` });
    case `getRenderObjectDiagnostics`:
      return await getRenderObjectDiagnostics(this, args[0], args[1]);
    case `getWidgetDiagnostics`:
      return await getWidgetDiagnostics(this, args[0], args[1]);
    case `getSemanticsId`:
      return await getSemanticsId(this, args[0]);
    case `waitForAbsent`:
      return await waitForAbsent(this, args[0], args[1]);
    case `waitFor`:
      return await waitFor(this, args[0], args[1]);
    case `waitForTappable`:
      return await waitForTappable(this, args[0], args[1]);
    case `scroll`:
      return await scroll(this, args[0], args[1]);
    case `scrollUntilVisible`:
      return await scrollUntilVisible(this, args[0], args[1]);
    case `scrollUntilTapable`:
      return await scrollUntilTapable(this, args[0], args[1]);
    case `scrollIntoView`:
      return await scrollIntoView(this, args[0], args[1]);
    case `setTextEntryEmulation`:
      return await setTextEntryEmulation(this, args[0]);
    case `enterText`:
      return await enterText(this, args[0]);
    case `requestData`:
      return await requestData(this, args[0]);
    case `longTap`:
      return await longTap(this, args[0], args[1]);
    case `waitForFirstFrame`:
      return await waitForCondition(this, { conditionName: `FirstFrameRasterizedCondition`});
    case `setFrameSync`:
      return await setFrameSync(this, args[0], args[1]);
    case `clickElement`:
      return await clickElement(this, args[0], args[1]);
    case `dragAndDropWithCommandExtension`:
      return await dragAndDropWithCommandExtension(this, args[0]);
    case `getTextWithCommandExtension`:
      return await getTextWithCommandExtension(this, args[0]);
    default:
      throw new Error(`Command not support: "${rawCommand}"`);
  }
};

const flutterLaunchApp = async (
  self: FlutterDriver, appId: string, opts
) => {
  const { arguments: args = [], environment: env = {}} = opts;
  await launchApp(self.internalCaps.udid!, appId, args, env);
  await reConnectFlutterDriver.bind(self)(self.internalCaps);
};

const connectObservatoryWsUrl = async (self: FlutterDriver) => {
  await reConnectFlutterDriver.bind(self)(self.internalCaps);
};

const checkHealth = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_health`)).status;

const getVMInfo = async (self: FlutterDriver) =>
  (await self.executeGetVMCommand());

const getRenderTree = async (self: FlutterDriver) =>
  (await self.executeElementCommand(`get_render_tree`)).tree;

const getOffset = async (
  self: FlutterDriver,
  elementBase64: string,
  offsetType: {offsetType: string},
) => await self.executeElementCommand(`get_offset`, elementBase64, offsetType);

const waitForCondition = async (
  self: FlutterDriver,
  conditionName: {conditionName: string},
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

const getIsolate = async (
  self: FlutterDriver, isolateId: string|undefined
) => await self.executeGetIsolateCommand(isolateId || self.socket!.isolateId);

const clearTimeline = async (self: FlutterDriver) => {
  // @todo backward compatible, need to cleanup later
  const call1: Promise<any> = self.socket!.call(`_clearVMTimeline`);
  const call2: Promise<any> = self.socket!.call(`clearVMTimeline`);
  const response = await B.any([call1, call2]);
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

const getWidgetDiagnostics = async (
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
      diagnosticsType: `widget`,
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

const setFrameSync = async (self, bool: boolean, durationMilliseconds: number) =>
  await self.socket!.executeSocketCommand({
    command: `set_frame_sync`,
    enabled: bool,
    timeout: durationMilliseconds,
  });

const setTextEntryEmulation = async (self: FlutterDriver, enabled: boolean) =>
  await self.socket!.executeSocketCommand({ command: `set_text_entry_emulation`, enabled });

const clickElement = async (self:FlutterDriver, elementBase64: string, opts) => {
  const {timeout = 1000} = opts;
  return await self.executeElementCommand(`tap`, elementBase64, {
        timeout
  });
};

const dragAndDropWithCommandExtension = async (
  self: FlutterDriver,
  params: {
    startX: string;
    startY: string;
    endX: string;
    endY: string;
    duration: string;
  }
) => {
  const { startX, startY, endX, endY, duration } = params;
  const commandPayload = {
    command: 'dragAndDropWithCommandExtension',
    startX,
    startY,
    endX,
    endY,
    duration,
  };
  return await self.socket!.executeSocketCommand(commandPayload);
};

const getTextWithCommandExtension = async (self: FlutterDriver, params: { findBy: string; }) => {
  const payload = {
      command: 'getTextWithCommandExtension',
      findBy: params.findBy,
  };
  return await self.socket!.executeSocketCommand(payload);
};
