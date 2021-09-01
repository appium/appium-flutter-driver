import { URL } from 'url';

import { deserialize } from '../../../finder/nodejs/lib/deserializer';
import { FlutterDriver } from '../driver';
import { log } from '../logger';
import { IsolateSocket } from './isolate_socket';

// SOCKETS
export const connectSocket = async (
  dartObservatoryURL: string,
  RETRY_BACKOFF: any = 3000,
  MAX_RETRY_COUNT: any = 30) => {
  let retryCount = 0;
  let connectedSocket: IsolateSocket | null = null;
  while (retryCount < MAX_RETRY_COUNT && !connectedSocket) {
    if (retryCount > 0) {
      log.info(
        `Waiting ` + RETRY_BACKOFF / 1000 + ` seconds before trying...`,
      );
      await new Promise((r) => setTimeout(r, RETRY_BACKOFF));
    }
    log.info(`Attempt #` + (retryCount + 1));

    const connectedPromise = new Promise<IsolateSocket | null>((resolve) => {
      log.info(
        `Connecting to Dart Observatory: ${dartObservatoryURL}`,
      );

      const socket = new IsolateSocket(dartObservatoryURL);

      const removeListenerAndResolve = (r: IsolateSocket | null) => {
        socket.removeListener(`error`, onErrorListener);
        socket.removeListener(`timeout`, onTimeoutListener);
        socket.removeListener(`open`, onOpenListener);
        resolve(r);
      };

      // Add an 'error' event handler for the client socket
      const onErrorListener = (ex) => {
        log.error(ex);
        log.error(
          `Check Dart Observatory URI ${dartObservatoryURL}`,
        );
        removeListenerAndResolve(null);
      };
      socket.on(`error`, onErrorListener);
      // Add a 'close' event handler for the client socket
      socket.on(`close`, () => {
        log.info(`Connection to ${dartObservatoryURL} closed`);
        // @todo do we need to set this.socket = null?
      });
      // Add a 'timeout' event handler for the client socket
      const onTimeoutListener = () => {
        log.error(`Connection to ${dartObservatoryURL} timed out`);
        removeListenerAndResolve(null);
      };
      socket.on(`timeout`, onTimeoutListener);
      const onOpenListener = async () => {
        // tslint:disable-next-line:ban-types
        const originalSocketCall: Function = socket.call;
        socket.call = async (...args: any) => {
          try {
            // `await` is needed so that rejected promise will be thrown and caught
            return await originalSocketCall.apply(socket, args);
          } catch (e) {
            log.errorAndThrow(JSON.stringify(e));
          }
        };
        log.info(`Connected to ${dartObservatoryURL}`);
        const vm = await socket.call(`getVM`) as {
          isolates: [{
            name: string,
            id: number,
          }],
        };
        log.info(`Listing all isolates: ${JSON.stringify(vm.isolates)}`);
        const mainIsolateData = vm.isolates.find((e) => e.name === `main`);
        if (!mainIsolateData) {
          log.error(`Cannot get Dart main isolate info`);
          removeListenerAndResolve(null);
          return;
        }
        socket.isolateId = mainIsolateData.id;
        // @todo check extension and do health check
        const isolate = await socket.call(`getIsolate`, {
          isolateId: `${socket.isolateId}`,
        }) as {
          extensionRPCs: [string] | null,
        } | null;
        if (!isolate) {
          log.error(`Cannot get main Dart Isolate`);
          removeListenerAndResolve(null);
          return;
        }
        if (!Array.isArray(isolate.extensionRPCs)) {
          log.errorAndThrow(`Cannot get Dart extensionRPCs from isolate ${JSON.stringify(isolate)}`);
          removeListenerAndResolve(null);
          return;
        }
        if (isolate.extensionRPCs.indexOf(`ext.flutter.driver`) < 0) {
          const msg = `"ext.flutter.driver" is not found in "extensionRPCs" ${JSON.stringify(isolate.extensionRPCs)}`;
          log.error(msg);
          removeListenerAndResolve(null);
          return;
        }
        removeListenerAndResolve(socket);
      };
      socket.on(`open`, onOpenListener);
    });
    retryCount++;
    connectedSocket = await connectedPromise;

    if (!connectedSocket && retryCount === MAX_RETRY_COUNT - 1) {
      log.errorAndThrow(
        `Failed to connect ` + MAX_RETRY_COUNT + ` times. Aborting.`,
      );
    }
  }
  retryCount = 0;
  return connectedSocket;
};

export const executeElementCommand = async function(
  this: FlutterDriver,
  command: string,
  elementBase64?: string,
  extraArgs = {}) {
  const elementObject = elementBase64 ? deserialize(elementBase64) : {};
  const serializedCommand = { command, ...elementObject, ...extraArgs };
  log.debug(`>>> ${JSON.stringify(serializedCommand)}`);
  const data = await this.socket!.executeSocketCommand(serializedCommand);
  log.debug(`<<< ${JSON.stringify(data)} | previous command ${command}`);
  if (data.isError) {
    throw new Error(
      `Cannot execute command ${command}, server reponse ${JSON.stringify(data, null, 2)}`,
    );
  }
  return data.response;
};

export const processLogToGetobservatory = (adbLogs: Array<{ message: string }>) => {
  const observatoryUriRegEx = new RegExp(
    `Observatory listening on ((http|\/\/)[a-zA-Z0-9:/=_\\-\.\\[\\]]+)`,
  );
  // @ts-ignore
  const observatoryMatch = adbLogs
    .map((e) => e.message)
    .reverse()
    .find((e) => e.match(observatoryUriRegEx))
    .match(observatoryUriRegEx);

  if (!observatoryMatch) {
    throw new Error(`can't find Observatory`);
  }

  const dartObservatoryURI = observatoryMatch[1];
  const dartObservatoryURL = new URL(dartObservatoryURI);

  dartObservatoryURL.protocol = `ws`;
  dartObservatoryURL.pathname += `ws`;

  return dartObservatoryURL;
};
