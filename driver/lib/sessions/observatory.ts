import { URL } from 'url';
import _ from 'lodash';
import type { FlutterDriver } from '../driver';
import { log } from '../logger';
import { IsolateSocket } from './isolate_socket';
import { decode } from './base64url';
import B from 'bluebird';
import type XCUITestDriver from 'appium-xcuitest-driver';
import type AndroidUiautomator2Driver from 'appium-uiautomator2-driver';
import { PLATFORM } from '../platform';

const truncateLength = 500;
// https://github.com/flutter/flutter/blob/f90b019c68edf4541a4c8273865a2b40c2c01eb3/dev/devicelab/lib/framework/runner.dart#L183
//  e.g. 'Observatory listening on http://127.0.0.1:52817/_w_SwaKs9-g=/'
// https://github.com/flutter/flutter/blob/52ae102f182afaa0524d0d01d21b2d86d15a11dc/packages/flutter_tools/lib/src/resident_runner.dart#L1386-L1389
//  e.g. 'An Observatory debugger and profiler on ${device.device.name} is available at: http://127.0.0.1:52817/_w_SwaKs9-g=/'
const OBSERVATORY_URL_PATTERN = new RegExp(
  `(Observatory listening on |` +
  `An Observatory debugger and profiler on\\s.+\\sis available at: |` +
  `The Dart VM service is listening on )` +
  `((http|//)[a-zA-Z0-9:/=_\\-.\\[\\]]+)`,
);
type AnyDriver = XCUITestDriver | AndroidUiautomator2Driver;

// SOCKETS
export const connectSocket = async (
  getObservatoryWsUri: (flutterDriver: FlutterDriver, driver: AnyDriver, caps: any) => Promise<string>,
  flutterDriver: FlutterDriver,
  driver: AnyDriver,
  caps: Record<string, any>
): Promise<IsolateSocket> => {

  const retryBackoff = caps.retryBackoffTime || 3000;
  const maxRetryCount = caps.maxRetryCount || 10;

  const isolateId = caps.isolateId;

  let retryCount = 0;
  let urlFetchError: Error|undefined;
  let dartObservatoryURL: string|undefined;
  log.debug(
    `Establishing a connection to the Dart Observatory. ` +
    `Will retry ${maxRetryCount} times with ${retryBackoff}ms delay between retries. ` +
    `These values could be customized by changing 'maxRetryCount' and 'retryBackoffTime' capabilities.`
  );
  while (retryCount < maxRetryCount) {
    if (retryCount > 0 && retryBackoff > 0) {
      log.info(`Waiting ${retryBackoff}ms before retrying`);
      await B.delay(retryBackoff);
    }
    log.info(`Attempt #${(retryCount + 1)} of ${maxRetryCount}`);

    // Every attempt gets the latest observatory url
    try {
      dartObservatoryURL = await getObservatoryWsUri(flutterDriver, driver, caps);
      urlFetchError = undefined;
    } catch (e) {
      urlFetchError = e;
      log.debug(`Got an error while finding an observatory url. Original error: ${e.message}`);
    }

    if (!urlFetchError) {
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
          log.error(`Connection to ${dartObservatoryURL} got an error: ${ex.message}`);
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
          const originalSocketCall = socket.call;
          socket.call = async (...args: any) => {
            try {
              // `await` is needed so that rejected promise will be thrown and caught
              return await originalSocketCall.apply(socket, args);
            } catch (e) {
              log.errorAndThrow(JSON.stringify(e));
            }
          };
          log.info(`Connecting to Dart Observatory: ${dartObservatoryURL}`);

          if (isolateId) {
            log.info(`Listing the given isolate id: ${isolateId}`);
            socket.isolateId = isolateId;
          } else {
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
          }

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
            log.error(`Cannot get Dart extensionRPCs from isolate ${JSON.stringify(isolate)}`);
            removeListenerAndResolve(null);
            return;
          }
          if (isolate.extensionRPCs.indexOf(`ext.flutter.driver`) < 0) {
            log.error(
              `"ext.flutter.driver" is not found in "extensionRPCs" ${JSON.stringify(isolate.extensionRPCs)}`
            );
            removeListenerAndResolve(null);
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
    }

    // re-create the port forward
    switch (_.toLower(caps.platformName)) {
      case PLATFORM.IOS:
        flutterDriver.localServer?.close();
        break;
      case PLATFORM.ANDROID:
        if (flutterDriver.portForwardLocalPort) {
          await driver.adb.removePortForward(flutterDriver.portForwardLocalPort);
        }
        break;
    }

    retryCount++;
  }
  throw new Error(
    urlFetchError
      ? (`Cannot determine the Dart Observatory URL after ${maxRetryCount} retries. ` +
        `Original error: ${urlFetchError.message}`)
      : (`Cannot connect to the Dart Observatory URL ${dartObservatoryURL} after ` +
        `${maxRetryCount} retries. Check the server log for more details`)
  );
};

export const executeGetIsolateCommand = async function(
  this: FlutterDriver,
  isolateId: string|number
) {
  log.debug(`>>> getIsolate`);
  const isolate = await this.socket!.call(`getIsolate`, { isolateId: `${isolateId}` });
  log.debug(`<<< ${_.truncate(JSON.stringify(isolate), {'length': truncateLength})}`);
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
  log.debug(`<<< ${_.truncate(JSON.stringify(vm), {'length': truncateLength})}`);
  return vm;
};

export const executeElementCommand = async function(
  this: FlutterDriver,
  command: string,
  elementBase64?: string,
  extraArgs = {}) {
  const elementObject = elementBase64 ? JSON.parse(decode(elementBase64)) : {};
  const serializedCommand = { command, ...elementObject, ...extraArgs };
  log.debug(`>>> ${JSON.stringify(serializedCommand)}`);
  const data = await this.socket!.executeSocketCommand(serializedCommand);
  log.debug(`<<< ${JSON.stringify(data)} | previous command ${command}`);
  if (data.isError) {
    throw new Error(
      `Cannot execute command ${command}, server response ${JSON.stringify(data, null, 2)}`,
    );
  }
  return data.response;
};

export const fetchObservatoryUrl = (deviceLogs: [{ message: string }]): URL => {
  let dartObservatoryURL: URL|undefined;
  for (const line of deviceLogs.map((e) => e.message).reverse()) {
    const match = line.match(OBSERVATORY_URL_PATTERN);
    if (match) {
      dartObservatoryURL = new URL(match[2]);
      break;
    }
  }
  if (!dartObservatoryURL) {
    throw new Error(`No observatory URL matching to '${OBSERVATORY_URL_PATTERN}' was found in the device log. ` +
      `Please make sure the application under test is configured properly according to ` +
      `https://github.com/appium-userland/appium-flutter-driver#usage and that it does not crash on startup.`);
  }
  dartObservatoryURL.protocol = `ws`;
  dartObservatoryURL.pathname += `ws`;
  return dartObservatoryURL;
};
