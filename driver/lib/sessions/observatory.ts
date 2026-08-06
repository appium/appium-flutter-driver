import {URL} from 'node:url';

import {retryInterval} from 'asyncbox';
import _ from 'lodash';

import type {FlutterDriver} from '../driver';
import {decode} from './base64url';
import {IsolateSocket} from './isolate_socket';
import type {LogEntry} from './log-monitor';

const truncateLength = 500;
// https://github.com/flutter/flutter/blob/f90b019c68edf4541a4c8273865a2b40c2c01eb3/dev/devicelab/lib/framework/runner.dart#L183
//  e.g. 'Observatory listening on http://127.0.0.1:52817/_w_SwaKs9-g=/'
// https://github.com/flutter/flutter/blob/52ae102f182afaa0524d0d01d21b2d86d15a11dc/packages/flutter_tools/lib/src/resident_runner.dart#L1386-L1389
//  e.g. 'An Observatory debugger and profiler on ${device.device.name} is available at: http://127.0.0.1:52817/_w_SwaKs9-g=/'
export const OBSERVATORY_URL_PATTERN = new RegExp(
  `(Observatory listening on |` +
    `An Observatory debugger and profiler on\\s.+\\sis available at: |` +
    `The Dart VM service is listening on )` +
    `((http|//)[a-zA-Z0-9:/=_\\-.\\[\\]]+)`,
);

const moduleCheckIntervalCount = 30;
const moduleCheckIntervalMs = 500;

// SOCKETS
/**
 * Opens an isolate socket for the given Flutter observatory URL.
 */
export async function connectSocket(
  this: FlutterDriver,
  dartObservatoryURL: string,
  caps: Record<string, any>,
): Promise<IsolateSocket> {
  const isolateId = caps.isolateId;

  this.log.debug(`Establishing a connection to the Dart Observatory`);

  const connectedPromise = new Promise<IsolateSocket | null>((resolve) => {
    const socket = new IsolateSocket(dartObservatoryURL);

    const removeListenerAndResolve = (r: IsolateSocket | null) => {
      socket.removeListener(`error`, onErrorListener);
      socket.removeListener(`timeout`, onTimeoutListener);
      socket.removeListener(`open`, onOpenListener);
      resolve(r);
    };

    // Add an 'error' event handler for the client socket
    const onErrorListener = (ex: Error) => {
      this.log.error(`Connection to ${dartObservatoryURL} got an error: ${ex.message}`);
      removeListenerAndResolve(null);
    };
    socket.on(`error`, onErrorListener);
    // Add a 'close' event handler for the client socket
    socket.on(`close`, () => {
      this.log.info(`Connection to ${dartObservatoryURL} closed`);
      // @todo do we need to set this.socket = null?
    });
    // Add a 'timeout' event handler for the client socket
    const onTimeoutListener = () => {
      this.log.error(`Connection to ${dartObservatoryURL} timed out`);
      removeListenerAndResolve(null);
    };
    socket.on(`timeout`, onTimeoutListener);
    const onOpenListener = async () => {
      const originalSocketCall = socket.call;
      socket.call = async (...args: any) => {
        try {
          // `await` is needed so that rejected promise will be thrown and caught
          return await originalSocketCall.apply(socket, args);
        } catch (e) {
          this.log.errorWithException(new Error(JSON.stringify(e)));
        }
      };
      this.log.info(`Connecting to Dart Observatory: ${dartObservatoryURL}`);

      try {
        await retryInterval(moduleCheckIntervalCount, moduleCheckIntervalMs, async () => {
          if (isolateId) {
            this.log.info(`Checking the given isolate id: ${isolateId}`);

            const isolate = (await socket.call(`getIsolate`, {
              isolateId: `${isolateId}`,
            })) as {
              extensionRPCs: string[] | null;
            } | null;

            if (
              !isolate ||
              !Array.isArray(isolate.extensionRPCs) ||
              !isolate.extensionRPCs.includes(`ext.flutter.driver`)
            ) {
              throw new Error(`"ext.flutter.driver" is not available in isolate ${isolateId}`);
            }

            socket.isolateId = isolateId;
            return;
          }

          // Refresh the isolate list on every retry because a background
          // engine may start before the UI engine.
          const vm = (await socket.call(`getVM`)) as {
            isolates: Array<{
              name: string;
              id: string | number;
              isolateGroupId?: string;
            }>;
          } | null;

          if (!vm || !Array.isArray(vm.isolates)) {
            throw new Error(`Cannot get Dart VM isolate list`);
          }

          this.log.info(`Listing all isolates: ${JSON.stringify(vm.isolates)}`);

          for (const candidate of vm.isolates) {
            const isolate = (await socket.call(`getIsolate`, {
              isolateId: `${candidate.id}`,
            })) as {
              extensionRPCs: string[] | null;
            } | null;

            if (
              isolate &&
              Array.isArray(isolate.extensionRPCs) &&
              isolate.extensionRPCs.includes(`ext.flutter.driver`)
            ) {
              socket.isolateId = candidate.id;

              this.log.info(
                `Selected Flutter driver isolate: ${candidate.id} ` +
                  `(${candidate.name}, group ${candidate.isolateGroupId ?? `unknown`})`,
              );

              return;
            }
          }

          throw new Error(`"ext.flutter.driver" was not found in any Dart isolate`);
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        this.log.error(message);
        removeListenerAndResolve(null);
        socket.close();
        return;
      }

      removeListenerAndResolve(socket);
    };
    socket.on(`open`, onOpenListener);
  });

  const connectedSocket = await connectedPromise;
  if (connectedSocket) {
    return connectedSocket;
  }

  throw new Error(
    `Cannot connect to the Dart Observatory URL ${dartObservatoryURL}. Check the server log for more details`,
  );
}

/**
 * Fetches isolate metadata from the connected Flutter VM service.
 */
export async function executeGetIsolateCommand(this: FlutterDriver, isolateId: string | number) {
  this.log.debug(`>>> getIsolate`);
  const isolate = await (this.socket as IsolateSocket).call(`getIsolate`, {
    isolateId: `${isolateId}`,
  });
  this.log.debug(`<<< ${_.truncate(JSON.stringify(isolate), {length: truncateLength})}`);
  return isolate;
}

/**
 * Fetches VM metadata from the connected Flutter VM service.
 */
export async function executeGetVMCommand(this: FlutterDriver) {
  this.log.debug(`>>> getVM`);
  const vm = (await (this.socket as IsolateSocket).call(`getVM`)) as {
    isolates: [
      {
        name: string;
        id: number;
      },
    ];
  };
  this.log.debug(`<<< ${_.truncate(JSON.stringify(vm), {length: truncateLength})}`);
  return vm;
}

/**
 * Executes an element command through the connected Flutter isolate socket.
 */
export async function executeElementCommand(
  this: FlutterDriver,
  command: string,
  elementBase64?: string,
  extraArgs = {},
) {
  const elementObject = elementBase64 ? JSON.parse(decode(elementBase64)) : {};
  const serializedCommand = {command, ...elementObject, ...extraArgs};
  this.log.debug(`>>> ${JSON.stringify(serializedCommand)}`);
  const data = await (this.socket as IsolateSocket).executeSocketCommand(serializedCommand);
  this.log.debug(`<<< ${JSON.stringify(data)} | previous command ${command}`);
  if (data.isError) {
    throw new Error(`Cannot execute command ${command}, server response ${JSON.stringify(data, null, 2)}`);
  }
  return data.response;
}

/**
 * Extracts the Flutter observatory URL from a device log entry.
 */
export function extractObservatoryUrl(logEntry: LogEntry): URL | null {
  const match = logEntry.message.match(OBSERVATORY_URL_PATTERN);
  if (!match) {
    return null;
  }

  try {
    const result = new URL(match[2]);
    result.protocol = `ws`;
    result.pathname += `ws`;
    return result;
  } catch {
    return null;
  }
}
