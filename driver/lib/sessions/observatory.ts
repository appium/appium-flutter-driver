import { URL } from 'url';

// @ts-ignore
import { Client } from 'rpc-websockets';

import { deserialize } from '../../../finder/lib/deserializer';
import { FlutterDriver } from '../driver';
import { log } from '../logger';

const MAX_RETRY_COUNT = 10;
const RETRY_BACKOFF = 300000;

class WebSocketDummy {}

export type NullableWebSocketDummy = WebSocketDummy | null;

// SOCKETS
export const connectSocket =  async (dartObservatoryURL: string) => {
  let retryCount = 0;
  let connectedSocket: NullableWebSocketDummy = null;
  while (retryCount < MAX_RETRY_COUNT && !connectedSocket) {
    if (retryCount > 0) {
      log.info(
        `Waiting ` + RETRY_BACKOFF / 1000 + ` seconds before trying...`,
      );
      await new Promise((r) => setTimeout(r, RETRY_BACKOFF));
    }
    log.info(`Attempt #` + (retryCount + 1));

    const connectedPromise = new Promise<NullableWebSocketDummy>((resolve) => {
      log.info(
        `Connecting to Dart Observatory: ${dartObservatoryURL}`,
      );

      const socket = new Client(dartObservatoryURL);

      const removeListenerAndResolve = (r: NullableWebSocketDummy) => {
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
        try {
          log.info(`Connected to ${dartObservatoryURL}`);
          const vm = await socket.call(`getVM`);
          socket.isolateId = vm.isolates[0].id;
          // @todo check extension and do health check
          const isolate = await socket.call(`getIsolate`, {
            isolateId: `${socket.isolateId}`,
          });
          removeListenerAndResolve(socket);
        } catch (e) {
          removeListenerAndResolve(null);
          log.error(`Cannot get Dart Isolate`);
          log.errorAndThrow(e);
        }
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
  const data = await executeSocketCommand(this.socket, serializedCommand);
  log.debug(`<<< ${JSON.stringify(data)} | previous command ${command}`);
  if (data.isError) {
    throw new Error(
      `Cannot execute command ${command}, server reponse ${JSON.stringify(data, null, 2)}`,
    );
  }
  return data.response;
};

const executeSocketCommand = async (socket, cmd) =>
  // call an RPC method with parameters
  socket.call(`ext.flutter.driver`, {
    ...cmd,
    isolateId: socket.isolateId,
  });

export const processLogToGetobservatory = (adbLogs: Array<{message: string}>) => {
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
