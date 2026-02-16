/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { FlutterDriver } from "../driver";
import { reConnectFlutterDriver } from "../sessions/session";
import {
  longTap,
  scroll,
  scrollIntoView,
  scrollUntilVisible,
  scrollUntilTapable,
} from "./execute/scroll";
import { waitFor, waitForAbsent, waitForTappable } from "./execute/wait";
import {
  assertVisible,
  assertNotVisible,
  assertTappable,
  type FinderInput,
} from "./assertions";

import { launchApp } from "./../ios/app";
import B from "bluebird";

const flutterCommandRegex = /^[\s]*flutter[\s]*:(.+)/;

// Define types for better type safety
type CommandHandler = (driver: FlutterDriver, ...args: any[]) => Promise<any>;
type CommandMap = Record<string, CommandHandler>;

interface DragAndDropParams {
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  duration: string;
}

interface DiagnosticsOptions {
  subtreeDepth?: number;
  includeProperties?: boolean;
}

interface LongTapOptions {
  durationMilliseconds: number;
  frequency?: number;
}

interface OffsetOptions {
  offsetType: "bottomLeft" | "bottomRight" | "center" | "topLeft" | "topRight";
}

// Extract command handlers into a separate object for better organization
const commandHandlers: CommandMap = {
  launchApp: async (driver, appId: string, opts = {}) => {
    const { arguments: args = [], environment: env = {} } = opts;
    await launchApp(driver.internalCaps.udid!, appId, args, env);
    await reConnectFlutterDriver.bind(driver)(driver.internalCaps);
  },
  connectObservatoryWsUrl: async (driver) => {
    await reConnectFlutterDriver.bind(driver)(driver.internalCaps);
  },
  checkHealth: async (driver) =>
    (await driver.executeElementCommand("get_health")).status,
  getVMInfo: async (driver) => await driver.executeGetVMCommand(),
  getRenderTree: async (driver) =>
    (await driver.executeElementCommand("get_render_tree")).tree,
  getOffset: async (driver, elementBase64: string, options: OffsetOptions) =>
    await driver.executeElementCommand("get_offset", elementBase64, options),
  waitForCondition: async (driver, conditionName: string) =>
    await driver.executeElementCommand("waitForCondition", "", {
      conditionName,
    }),
  forceGC: async (driver) => {
    const response = (await driver.socket!.call("_collectAllGarbage", {
      isolateId: driver.socket!.isolateId,
    })) as { type: string };
    if (response.type !== "Success") {
      throw new Error(
        `Could not forceGC, response was ${JSON.stringify(response)}`,
      );
    }
  },
  setIsolateId: async (driver, isolateId: string) => {
    driver.socket!.isolateId = isolateId;
    return await driver.socket!.call("getIsolate", { isolateId });
  },
  getIsolate: async (driver, isolateId?: string) =>
    await driver.executeGetIsolateCommand(
      isolateId || driver.socket!.isolateId!,
    ),
  clearTimeline: async (driver) => {
    const call1 = driver.socket!.call("_clearVMTimeline");
    const call2 = driver.socket!.call("clearVMTimeline");
    const response = await B.any([call1, call2]);
    if (response.type !== "Success") {
      throw new Error(
        `Could not clear timeline, response was ${JSON.stringify(response)}`,
      );
    }
  },
  getRenderObjectDiagnostics: async (
    driver,
    elementBase64: string,
    opts: DiagnosticsOptions = {},
  ) => {
    const { subtreeDepth = 0, includeProperties = true } = opts;
    return await driver.executeElementCommand(
      "get_diagnostics_tree",
      elementBase64,
      {
        diagnosticsType: "renderObject",
        includeProperties,
        subtreeDepth,
      },
    );
  },
  getWidgetDiagnostics: async (
    driver,
    elementBase64: string,
    opts: DiagnosticsOptions = {},
  ) => {
    const { subtreeDepth = 0, includeProperties = true } = opts;
    return await driver.executeElementCommand(
      "get_diagnostics_tree",
      elementBase64,
      {
        diagnosticsType: "widget",
        includeProperties,
        subtreeDepth,
      },
    );
  },
  getSemanticsId: async (driver, elementBase64: string) =>
    (await driver.executeElementCommand("get_semantics_id", elementBase64)).id,
  waitForAbsent: async (driver, finder: string, timeout?: number) =>
    await waitForAbsent(driver, finder, timeout),
  waitFor: async (driver, finder: string, timeout?: number) =>
    await waitFor(driver, finder, timeout),
  waitForTappable: async (driver, finder: string, timeout?: number) =>
    await waitForTappable(driver, finder, timeout),
  scroll: async (driver, finder: string, opts: any) =>
    await scroll(driver, finder, opts),
  scrollUntilVisible: async (driver, finder: string, opts: any) =>
    await scrollUntilVisible(driver, finder, opts),
  scrollUntilTapable: async (driver, finder: string, opts: any) =>
    await scrollUntilTapable(driver, finder, opts),
  scrollIntoView: async (driver, finder: string, opts: any) =>
    await scrollIntoView(driver, finder, opts),
  setTextEntryEmulation: async (driver, enabled: boolean) =>
    await driver.socket!.executeSocketCommand({
      command: "set_text_entry_emulation",
      enabled,
    }),
  enterText: async (driver, text: string) =>
    await driver.socket!.executeSocketCommand({ command: "enter_text", text }),
  requestData: async (driver, message: string) =>
    await driver.socket!.executeSocketCommand({
      command: "request_data",
      message,
    }),
  longTap: async (driver, finder: string, durationOrOptions: LongTapOptions) =>
    await longTap(driver, finder, durationOrOptions),
  waitForFirstFrame: async (driver) =>
    await driver.executeElementCommand("waitForCondition", "", {
      conditionName: "FirstFrameRasterizedCondition",
    }),
  setFrameSync: async (
    driver,
    enabled: boolean,
    durationMilliseconds: number,
  ) =>
    await driver.socket!.executeSocketCommand({
      command: "set_frame_sync",
      enabled,
      timeout: durationMilliseconds,
    }),
  clickElement: async (
    driver,
    finder: string,
    opts: { timeout?: number } = {},
  ) => {
    const { timeout = 1000 } = opts;
    return await driver.executeElementCommand("tap", finder, { timeout });
  },
  dragAndDropWithCommandExtension: async (driver, params: DragAndDropParams) =>
    await driver.socket!.executeSocketCommand({
      command: "dragAndDropWithCommandExtension",
      ...params,
    }),
  assertVisible: async (driver, input: FinderInput, timeout = 5000) =>
    await assertVisible(driver, input, timeout),
  assertNotVisible: async (driver, input: FinderInput, timeout = 5000) =>
    await assertNotVisible(driver, input, timeout),
  assertTappable: async (driver, input: FinderInput, timeout = 5000) =>
    await assertTappable(driver, input, timeout),
  getTextWithCommandExtension: async (driver, params: { findBy: string }) =>
    await driver.socket!.executeSocketCommand({
      command: "getTextWithCommandExtension",
      findBy: params.findBy,
    }),
};
export const execute = async function (
  this: FlutterDriver,
  rawCommand: string,
  args: any[],
) {
  const matching = rawCommand.match(flutterCommandRegex);
  if (!matching) {
    throw new Error(`Command not supported: "${rawCommand}"`);
  }

  const command = matching[1].trim();
  const handler = commandHandlers[command];

  if (!handler) {
    throw new Error(`Command not supported: "${rawCommand}"`);
  }

  return await handler(this, ...args);
};
