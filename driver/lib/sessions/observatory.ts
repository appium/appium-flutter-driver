import { URL } from 'url';
import _ from 'lodash';
import { deserialize } from '../../../finder/nodejs/lib/deserializer';
import { FlutterDriver } from '../driver';
import { log } from '../logger';
import { IsolateSocket } from './isolate_socket';

const truncateLength = 500;

// SOCKETS
export const connectSocket = async (
  getObservatoryWsUri,
  driver: any,
  caps: any) => {

  const retryBackoff = caps.retryBackoffTime || 3000
  const maxRetryCount = caps.maxRetryCount || 30

  let retryCount = 0;
  let connectedSocket: IsolateSocket | null = null;

  while (retryCount < maxRetryCount && !connectedSocket) {
    if (retryCount > 0) {
      log.info(
        `Waiting ` + retryBackoff / 1000 + ` seconds before trying...`,
      );
      await new Promise((r) => setTimeout(r, retryBackoff));
    }
    log.info(`Attempt #` + (retryCount + 1));

    const dartObservatoryURL = await getObservatoryWsUri(driver, caps);

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
        log.info(`Connecting to ${dartObservatoryURL}`);
        const vm = await socket.call(`getVM`) as {
          isolates: [{
            name: string,
            id: number,
          }],
        };
        log.info(`Listing all isolates: ${JSON.stringify(vm.isolates)}`);
        // To accept 'main.dart:main()' and 'main'
        const mainIsolateData = vm.isolates.find((e) => e.name.includes(`main`));
        if (!mainIsolateData) {
          log.error(`Cannot get Dart main isolate info`);
          removeListenerAndResolve(null);
          socket.close();
          return;
        }
        // e.g. 'isolates/2978358234363215', '2978358234363215'
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

    if (!connectedSocket && retryCount === maxRetryCount - 1) {
      log.errorAndThrow(
        `Failed to connect ` + maxRetryCount + ` times. Aborting.`,
      );
    }
  }
  retryCount = 0;
  return connectedSocket;
};

export const executeGetIsolateCommand = async function(
  this: FlutterDriver,
  isolateId: string|number
) {
  log.debug(`>>> getIsolate`);
  const isolate = await this.socket!.call(`getIsolate`, { isolateId: `${isolateId}` });
  log.debug(`<<< ${_.truncate(JSON.stringify(isolate), {
    'length': truncateLength, 'omission': `...` })}`);
  return isolate;
};

export const executeGetVMCommand = async function(this: FlutterDriver) {
  log.debug(`>>> getVM`);
  const vm = await this.socket!.call(`getVM`) as {
    isolates: [{
      name: string,
      id: number,
    }],
  };
  log.debug(`<<< ${_.truncate(JSON.stringify(vm), {
    'length': truncateLength, 'omission': `...` })}`);
  return vm;
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

export const processLogToGetobservatory = (adbLogs: [{ message: string }]) => {
  // https://github.com/flutter/flutter/blob/f90b019c68edf4541a4c8273865a2b40c2c01eb3/dev/devicelab/lib/framework/runner.dart#L183
  //  e.g. 'Observatory listening on http://127.0.0.1:52817/_w_SwaKs9-g=/'
  // https://github.com/flutter/flutter/blob/52ae102f182afaa0524d0d01d21b2d86d15a11dc/packages/flutter_tools/lib/src/resident_runner.dart#L1386-L1389
  //  e.g. 'An Observatory debugger and profiler on ${device.device.name} is available at: http://127.0.0.1:52817/_w_SwaKs9-g=/'
  const observatoryUriRegEx = new RegExp(
    `(Observatory listening on |An Observatory debugger and profiler on\\s.+\\sis available at: |The Dart VM service is listening on )((http|\/\/)[a-zA-Z0-9:/=_\\-\.\\[\\]]+)`,
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

  const dartObservatoryURI = observatoryMatch[2];
  const dartObservatoryURL = new URL(dartObservatoryURI);

  dartObservatoryURL.protocol = `ws`;
  dartObservatoryURL.pathname += `ws`;

  return dartObservatoryURL;
};
