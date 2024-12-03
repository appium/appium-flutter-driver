# Appium Flutter Driver

[![NPM version](https://img.shields.io/npm/v/appium-flutter-driver.svg)](https://npmjs.org/package/appium-flutter-driver)
[![Downloads](https://img.shields.io/npm/dm/appium-flutter-driver.svg)](https://npmjs.org/package/appium-flutter-driver)

Appium Flutter Driver is a test automation tool for [Flutter](https://flutter.dev) apps on multiple platforms/OSes. Appium Flutter Driver is part of the [Appium](https://github.com/appium/appium) mobile test automation tool maintained by the community. Feel free to create PRs to fix issues/improve this driver.

## Flutter Driver vs Appium Flutter Driver
Even though Flutter comes with superb integration test support, [Flutter Driver](https://flutter.dev/docs/cookbook/testing/integration/introduction), it does not fit some specific use cases, such as
- Writing tests in other languages than Dart
- Running integration test for Flutter app with embedded webview or native view, or existing native app with embedded Flutter view
- Running tests on multiple devices simultaneously
- Running integration tests on device farms that offer Appium support (Please contact the availability for each vendor)

Under the hood, Appium Flutter Driver uses the [Dart VM Service Protocol](https://github.com/dart-lang/sdk/blob/master/runtime/vm/service/service.md) with extension `ext.flutter.driver`, similar to Flutter Driver, to control the Flutter app-under-test (AUT).

## Appium drivers for Flutter

Appium community currently has two drivers for Flutter environment:

- Appium Flutter driver (this driver)
    - Run Flutter commands over websocekt connection against the observaory URL (calls Flutter APIs directly)
    - Base APIs are [`flutter_driver`](https://api.flutter.dev/flutter/flutter_driver/flutter_driver-library.html)
- [`Appium Flutter Integration Driver`](https://github.com/AppiumTestDistribution/appium-flutter-integration-driver)
    - Run a server on DartVM as part of the application under test in order to call Flutter APIs via the server
    - Base APIs are [`integration_test`](https://github.com/flutter/flutter/tree/main/packages/integration_test#integration_test)

## Appium Flutter Driver or Appium UiAutomator2/XCUITest driver

As a baseline, we recommend using [official testing tools and strategy](https://docs.flutter.dev/testing/overview) to test Flutter apps as possible in Dart.

If you'd like to test a release app, whcih can be released from app store as-is, Appium [UIAutomator2](https://github.com/appium/appium-uiautomator2-driver)/[XCUITest](https://github.com/appium/appium-xcuitest-driver) driver is a good choice. Since Flutter 3.19, Flutter apps can expose [`identifier` for `SemanticsProperties`](https://api.flutter.dev/flutter/semantics/SemanticsProperties/identifier.html) as `resource-id` in Android and `accessibilityIdentifier` in iOS. They should help to achieve automation against release apps with Appium [UIAutomator2](https://github.com/appium/appium-uiautomator2-driver)/[XCUITest](https://github.com/appium/appium-xcuitest-driver) as blackbox testing.

- Appium Flutter driver has three contexts to manage the application under test and the device under test. To achieve the `FLUTTER` context, the test package requires testing tools to import. The application under test cannot release as-is.
    - `FLUTTER` context sends commands to the Dart VM directly over the observatory URL. This allows you to interact with Flutter elements directly.
    - `NATIVE_APP` context is the same as the regular Appium [UIAutomator2](https://github.com/appium/appium-uiautomator2-driver)/[XCUITest](https://github.com/appium/appium-xcuitest-driver) driver
    - `WEBVIEW` context manages the WebView contents over Appium UiAutomator2/XCUITest driver
- (**Recommended** if possible) Appium [UIAutomator2](https://github.com/appium/appium-uiautomator2-driver)/[XCUITest](https://github.com/appium/appium-xcuitest-driver) driver directly must be sufficient to achieve automation if the application under test had `semanticLabel` properly. Then, the accessibility mechanism in each OS can expose elements for Appium through OS's accessibility features.
    - In addition to `semanticLabel`, Flutter 3.19+ may have [`identifier` for `SemanticsProperties`](https://api.flutter.dev/flutter/semantics/SemanticsProperties/identifier.html) (introduced by https://github.com/flutter/flutter/pull/138331). It sets `resource-id` and `accessibilityIdentifier` for Android and iOS, then UiAutomator2/XCUITest drivers might also be able to interact with these elements without Appium Flutter Driver.
        - `"appium:settings[disableIdLocatorAutocompletion]": true` or configuring `disableIdLocatorAutocompletion` via [Settings API](https://appium.io/docs/en/latest/guides/settings/) would be necessary to make `resource-id` idea work without any package name prefix like Android compose.
        - e.g. https://github.com/flutter/flutter/issues/17988#issuecomment-1867097631

## Installation

Appium Flutter Driver version 1.0 and higher require Appium 2.0.

```
appium driver install --source=npm appium-flutter-driver
```

As a local:

```
appium driver install --source local /path/to/appium-flutter-driver/driver
```

## Usage and requirement
If you are unfamiliar with running Appium tests, start with [Quickstart Intro](https://appium.io/docs/en/latest/quickstart/) first.

Your Flutter application must be compiled in `debug` or `profile` mode. The dependency must have **[`flutter_driver`](https://api.flutter.dev/flutter/flutter_driver/flutter_driver-library.html)** package like the below `pubspec.yaml` example with [`enableFlutterDriverExtension`](https://api.flutter.dev/flutter/flutter_driver_extension/flutter_driver_extension-library.html) configuration in the `main.dart`.

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_driver:
    sdk: flutter
```

This snippet, taken from [example directory](example), is a script written as an appium client with `webdriverio`, and assumes you have `appium` server (with `appium-flutter-driver` installed) running on the same host and default port (`4723`). For more info, see example's [README.md](https://github.com/appium/appium-flutter-driver/tree/main/example/nodejs/README.md)

> **Note**
>
> This means this driver depends on [`flutter_driver`](https://api.flutter.dev/flutter/flutter_driver/flutter_driver-library.html).
> In the past, the Flutter team announced replacing `flutter_driver` with `integration_test`, but according to [this ticket](https://github.com/flutter/flutter/issues/148028), this discussion is still ongoing.
> So flutter_driver would continue to be maintained for now.

Each client needs [each finder](finder) module to handle [Finders](#Finders). Appium Flutter Driver communicates with the Dart VM directory in the `FLUTTER` context.

### Doctor
Since driver version 2.4.0 you can automate the validation for the most of the above requirements as well as various optional ones needed by driver extensions by running the `appium driver doctor flutter` server command.
The check runs for Android for UIAutomator2 driver and iOS for XCUITest driver.

`SKIP_ANDROID` or `SKIP_IOS` environment variable helps to skip these checks.

```
# skip Android check
SKIP_ANDROID=1 appium driver doctor flutter
# skip iOS check
SKIP_IOS=1 appium driver doctor flutter
```

### Note
- Flutter context does not support page source
    - Please use `getRenderTree` command instead
- You can send appium-xcuitest-driver/appium-uiautomator2-driver commands in `NATIVE_APP` context
- `scrollUntilVisible` command : An expectation for checking that an element, known to be present on the widget tree, is visible. Using waitFor to wait element
- `scrollUntilTapable` command : An expectation for checking an element is visible and enabled such that you can click it. Using waitTapable to wait element
- `driver.activateApp(appId)` starts the given app and attaches to the observatory URL in the `FLUTTER` context. The method may raise an exception if no observaotry URL was found. The typical case is the `appId` is already running. Then, the driver will fail to find the observatory URL.
- `getClipboard` and `setClipboard` depend on each `NATIVE_APP` context behavior
- Launch via `flutter:launchApp` or 3rd party tool (via instrument service) and attach to the Dart VM for an iOS real device (profile build)
    1. Do not set `app` nor `bundleId` to start a session without launching apps
    2. Start the app process via 3rd party tools such as [go-ios](https://github.com/danielpaulus/go-ios) to start the app process with debug mode in the middle of the new session process in 1) the above.
          - Then, the appium flutter session establish the WebSocket and proceed the session
- keyboard interaction may not work in Android because of https://github.com/flutter/flutter/issues/15415 that is caused by [`flutter_driver`](https://api.flutter.dev/flutter/flutter_driver/flutter_driver-library.html)

## Capabilities

### For the Appium Flutter Driver only

| Capability | Description | Example Values |
| - | - | -|
| appium:retryBackoffTime | The interval to find the observetory url from logs. (default 3000ms)|500|
| appium:maxRetryCount    | The count to find the observatory url. (default 10)          | 20|
| appium:observatoryWsUri | The URL to attach to the Dart VM. The Appium Flutter Driver finds the WebSocket URL from the device log by default. You can skip the finding the URL process by specifying this capability. Then, this driver attempt to establish a WebSocket connection against the given WebSocket URL. Note that this capability expects the URL is ready for access by outside an appium session. This flutter driver does not do port-forwarding with this capability. You may need to coordinate the port-forwarding as well. | 'ws://127.0.0.1:60992/aaaaaaaaaaa=/ws' |
| appium:isolateId | The isolate id to attach to as the initial attempt. A session can change the isolate with `flutter:setIsolateId` command. The default behavior finds `main` isolate id and attaches it. | `isolates/2978358234363215`, `2978358234363215` |
| appium:skipPortForward | Whether skip port forwarding from the flutter driver local to the device under test with `observatoryWsUri` capability. It helps you to manage the application under test, the observatory URL and the port forwarding configuration. The default is `true`. | true, false |
| appium:remoteAdbHost | The IP/hostname of the remote host ADB is running on. This capability only makes sense for Android platform. Providing it will implicitly override the host for the Observatory URL if the latter is determined from device logs. localhost be default | 192.168.1.20
| appium:adbPort | The port number ADB server is running on. This capability only makes sense for Android platform. 5037 by default | 9999
| appium:forwardingPort | The port number that will be used to forward the traffic from the device under test to locahost. Only applicable if `skipPortForward` is falsy. Not applicable if the test is executed on iOS Simulator. By default, it is the same as in the provided or autodetected Observatory URL. | 9999

### UIA2/XCUITest driver

Please check each driver's documentation
- https://github.com/appium/appium-uiautomator2-driver
- https://appium.github.io/appium-xcuitest-driver/latest/capabilities/

## Context Management

Appium Flutter Driver allows you to send [`flutter_driver`](https://api.flutter.dev/flutter/flutter_driver/flutter_driver-library.html) commands to the Dart VM in the `FLUTTER` context, but it does not support native Android/iOS since the Dart VM can handle in the Dart VM contents. `NATIVE_APP` context provides you to use the UIA2 driver for Android and the XCUITest driver for iOS automation. `WEBVIEW_XXXX` context helps WebView testing over the UIA2/XCUITest driver that is not available via the flutter_driver.

Thus, you need to switch proper contexts, `FLUTTER`, `NATIVE_APP` or `WEBVIEW_XXXX`, to automate a proper application target.

### Example

```js
# webdriverio
const wdio = require('webdriverio');
const assert = require('assert');
const { byValueKey } = require('appium-flutter-finder');

const osSpecificOps = process.env.APPIUM_OS === 'android' ? {
  'platformName': 'Android',
  'appium:deviceName': 'Pixel 2',
  'appium:app': __dirname +  '/../apps/app-free-debug.apk',
}: process.env.APPIUM_OS === 'ios' ? {
  'platformName': 'iOS',
  'appium:platformVersion': '12.2',
  'appium:deviceName': 'iPhone X',
  'appium:noReset': true,
  'appium:app': __dirname +  '/../apps/Runner.zip',
} : {};

const opts = {
  port: 4723,
  capabilities: {
    ...osSpecificOps,
    'appium:automationName': 'Flutter',
    'appium:retryBackoffTime': 500
  }
};

(async () => {
  const counterTextFinder = byValueKey('counter');
  const buttonFinder = byValueKey('increment');

  const driver = await wdio.remote(opts);

  if (process.env.APPIUM_OS === 'android') {
    await driver.switchContext('NATIVE_APP');
    await (await driver.$('~fab')).click();
    await driver.switchContext('FLUTTER');
  } else {
    console.log('Switching context to `NATIVE_APP` is currently only applicable to Android demo app.')
  }

  assert.strictEqual(await driver.getElementText(counterTextFinder), '0');

  await driver.elementClick(buttonFinder);
  await driver.touchAction({
    action: 'tap',
    element: { elementId: buttonFinder }
  });

  assert.strictEqual(await driver.getElementText(counterTextFinder), '2');

  driver.deleteSession();
})();
```

Please check [example](example) in this repository for more languages.

## Several ways to start an application

You have a couple of methods to start the application under test by establishing the Dart VM connection as below:

1. Start with `app` in the capabilities
    1. The most standard method. You may need to start a new session with `app` capability. Then, appium-flutter-driver will start the app, and establish a connection with the Dart VM immediately.
2. Start with `activate_app`: for users who want to start the application under test in the middle of a session
    1. Start a session without `app` capability
    2. Install the application under test via `driver.install_app` or `mobile:installApp` command
    3. Activate the app via `driver.activate_app` or `mobile:activateApp` command
        - Then, appium-flutter-driver establish a connection with the Dart VM
3. Launch the app outside the driver: for users who want to manage the application under test by yourselves
    1. Start a session without `app` capability
    2. Install the application under test via `driver.install_app` or `mobile:installApp` command etc
    3. Calls `flutter:connectObservatoryWsUrl` command to keep finding an observatory URL to the Dart VM
    4. (at the same time) Launch the application under test via outside the appium-flutter-driver
        - e.g. Launch an iOS process via [ios-go](https://github.com/danielpaulus/go-ios), [iproxy](https://github.com/libimobiledevice/libusbmuxd#iproxy) or [tidevice](https://github.com/alibaba/taobao-iphone-device)
    5. Once `flutter:connectObservatoryWsUrl` identify the observatory URL, the command will establish a connection to the Dart VM
4. Launch the app with `flutter:launchApp` for iOS and attach to the Dart VM: for users whom application under test do not print the observatory url via regular launch/activate app method
    1. Start a session without `app` capability
    2. Install the application under test via `driver.install_app` or `mobile:installApp` command etc
    3. Calls `flutter:launchApp` command to start an iOS app via instrument service
        - `driver.execute_script 'flutter:launchApp', 'com.example.bundleId', {arguments: ['arg1'], environment: {ENV1: 'env'}}` is example usage
        - This launching method is the same as the above 3rd party method, but does the same thing only via the appium flutter driver.

Please make sure the target app process stops before starting the target app with the above.

## Changelog

- [appium-flutter-driver](driver/CHANGELOG.md)
- [each finder](finder)


## Commands for NATIVE_APP/WEBVIEW context

Please check each driver's documentation
- https://github.com/appium/appium-uiautomator2-driver
- https://appium.github.io/appium-xcuitest-driver/latest

## Commands for FLUTTER context

Legend:

| Icon | Description |
| - | - |
| :white_check_mark: | integrated to CI |
| :ok: | manual tested without CI |
| :warning: | available without manual tested |
| :x: | unavailable |

### Finders

| Flutter Driver API | Status | WebDriver example |
| - | - | - |
| [ancestor](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/ancestor.html) | :ok: |  |
| [bySemanticsLabel](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/bySemanticsLabel.html) | :ok: |  |
| [byTooltip](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/byTooltip.html) | :ok: | `byTooltip('Increment')` |
| [byType](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/byType.html) | :ok: | `byType('TextField')` |
| [byValueKey](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/byValueKey.html) | :ok: | [`byValueKey('counter')`](https://github.com/appium/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L30) |
| [descendant](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/descendant.html) | :ok: |  |
| [pageBack](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/pageBack.html) | :ok: | `pageBack()` |
| [text](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/text.html) | :ok: | `byText('foo')` |

### Commands

The below _WebDriver example_ is by webdriverio.
`flutter:` prefix commands are [`mobile:` command in appium for Android and iOS](https://appium.io/docs/en/latest/guides/execute-methods/).
Please replace them properly with your client.

| Flutter API                                                                                                                        | Status | WebDriver example (JavaScript, webdriverio) | Scope             |
|------------------------------------------------------------------------------------------------------------------------------------| - | - |-------------------|
| [FlutterDriver.connectedTo](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/FlutterDriver.connectedTo.html)           | :ok: | [`wdio.remote(opts)`](https://github.com/appium/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L33) | Session           |
| [checkHealth](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/checkHealth.html)                                       | :ok: | `driver.execute('flutter:checkHealth')` | Session           |
| clearTextbox                                                                                                                       | :ok: | `driver.elementClear(find.byType('TextField'))` | Session           |
| [clearTimeline](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/clearTimeline.html)                                   | :ok: | `driver.execute('flutter:clearTimeline')` | Session           |
| [enterText](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/enterText.html)                                           | :ok: | `driver.elementSendKeys(find.byType('TextField'), 'I can enter text')` (no focus required) <br/> `driver.elementClick(find.byType('TextField')); driver.execute('flutter:enterText', 'I can enter text')` (focus required by tap/click first) | Session           |
| [forceGC](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/forceGC.html)                                               | :ok: | `driver.execute('flutter:forceGC')` | Session           |
| [getBottomLeft](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getBottomLeft.html)                                   | :ok: | `driver.execute('flutter:getBottomLeft', buttonFinder)` | Widget            |
| [getBottomRight](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getBottomRight.html)                                 | :ok: | `driver.execute('flutter:getBottomRight', buttonFinder)` | Widget            |
| [getCenter](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getCenter.html)                                           | :ok: | `driver.execute('flutter:getCenter', buttonFinder)` | Widget            |
| [getRenderObjectDiagnostics](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getRenderObjectDiagnostics.html)         | :ok: | `driver.execute('flutter:getRenderObjectDiagnostics', counterTextFinder, { includeProperties: true, subtreeDepth: 2 })` | Widget            |
| [getWidgetDiagnostics](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getWidgetDiagnostics.html)                     | :ok: (v2.8.0+) | `driver.execute('flutter:getWidgetDiagnostics', counterTextFinder, { includeProperties: true, subtreeDepth: 2 })` | Widget            |
| [getRenderTree](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getRenderTree.html)                                   | :ok: | `driver.execute('flutter: getRenderTree')` | Session           |
| [getSemanticsId](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getSemanticsId.html)                                 | :ok: | `driver.execute('flutter:getSemanticsId', counterTextFinder)` | Widget            |
| [getText](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getText.html)                                               | :ok: | [`driver.getElementText(counterTextFinder)`](https://github.com/appium/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L44) | Widget            |
| [getTopLeft](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getTopLeft.html)                                         | :ok: | `driver.execute('flutter:getTopLeft', buttonFinder)` | Widget            |
| [getTopRight](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getTopRight.html)                                       | :ok: | `driver.execute('flutter:getTopRight', buttonFinder)` | Widget            |
| [getVmFlags](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getVmFlags.html)                                         | :x: |  | Session           |
| [requestData](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/requestData.html)                                       | :ok: | `driver.execute('flutter:requestData', json.dumps({"deepLink": "myapp://item/id1"}))`  | Session           |
| [runUnsynchronized](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/runUnsynchronized.html)                           | :x: |  | Session           |
| [setFrameSync](https://api.flutter.dev/flutter/flutter_driver/SetFrameSync-class.html)                                             |:ok:| `driver.execute('flutter:setFrameSync', bool , durationMilliseconds)`| Session           |
| [screenshot](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/screenshot.html)                                         | :ok: | `driver.takeScreenshot()` | Session           |
| [screenshot](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/screenshot.html)                                         | :ok: | `driver.saveScreenshot('a.png')` | Session           |
| [scroll](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scroll.html)                                                 | :ok: | `driver.execute('flutter:scroll', find.byType('ListView'), {dx: 50, dy: -100, durationMilliseconds: 200, frequency: 30})` | Widget            |
| [scrollIntoView](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scrollIntoView.html)                                 | :ok: | `driver.execute('flutter:scrollIntoView', find.byType('TextField'), {alignment: 0.1})` <br/> `driver.execute('flutter:scrollIntoView', find.byType('TextField'), {alignment: 0.1, timeout: 30000})` | Widget            |
| [scrollUntilVisible](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scrollUntilVisible.html)                         | :ok: | `driver.execute('flutter:scrollUntilVisible', find.byType('ListView'), {item:find.byType('TextField'), dxScroll: 90, dyScroll: -400});`, `driver.execute('flutter:scrollUntilVisible', find.byType('ListView'), {item:find.byType('TextField'), dxScroll: 90, dyScroll: -400, waitTimeoutMilliseconds: 20000});` | Widget            |
| [scrollUntilTapable](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scrollUntilVisible.html)                         | :ok: | `driver.execute('flutter:scrollUntilTapable', find.byType('ListView'), {item:find.byType('TextField'), dxScroll: 90, dyScroll: -400});`, `driver.execute('flutter:scrollUntilTapable', find.byType('ListView'), {item:find.byType('TextField'), dxScroll: 90, dyScroll: -400, waitTimeoutMilliseconds: 20000});` | Widget            |
| [setSemantics](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/setSemantics.html)                                     | :x: |  | Session           |
| [setTextEntryEmulation](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/setTextEntryEmulation.html)                   | :ok: | `driver.execute('flutter:setTextEntryEmulation', false)` | Session           |
| [startTracing](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/startTracing.html)                                     | :x: |  | Session           |
| [stopTracingAndDownloadTimeline](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/stopTracingAndDownloadTimeline.html) | :x: |  | Session           |
| [tap](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/tap.html)                                                       | :ok: | [`driver.elementClick(buttonFinder)`](https://github.com/appium/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L46) | Widget            |
| [tap](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/tap.html)                                                       | :ok: | [`driver.touchAction({action: 'tap', element: {elementId: buttonFinder}})`](https://github.com/appium/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L47) | Widget            |
| [tap](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/tap.html)                                                       | :ok: | [`driver.execute('flutter:clickElement', buttonFinder, {timeout:5000})`](https://github.com/appium/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L47) | Widget            |
| [traceAction](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/traceAction.html)                                       | :x: |  | Session           |
| [waitFor](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitFor.html)                                               | :ok: | `driver.execute('flutter:waitFor', buttonFinder, 100)` | Widget            |
| [waitForAbsent](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitForAbsent.html)                                   | :ok: | `driver.execute('flutter:waitForAbsent', buttonFinder)` | Widget            |
| [waitForTappable](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitForTappable.html)                               | :ok: | `driver.execute('flutter:waitForTappable', buttonFinder)` | Widget            |
| [waitUntilNoTransientCallbacks](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitUntilNoTransientCallbacks.html)   | :x: |  | Widget            |
| -                                                                                                                                  | :ok: | `driver.execute('flutter:getVMInfo')` | System            |
| -                                                                                                                                  | :ok: | `driver.execute('flutter:setIsolateId', 'isolates/2978358234363215')` | System            |
| -                                                                                                                                  | :ok: | `driver.execute('flutter:getIsolate', 'isolates/2978358234363215')` or `driver.execute('flutter:getIsolate')` | System            |
| :question:                                                                                                                         | :ok: | `driver.execute('flutter:longTap', find.byValueKey('increment'), {durationMilliseconds: 10000, frequency: 30})` | Widget            |
| :question:                                                                                                                         | :ok: | `driver.execute('flutter:waitForFirstFrame')` | Widget            |
| -                                                                                                                                  | :ok: | (Ruby) `driver.execute_script 'flutter:connectObservatoryWsUrl'` | Flutter Driver    |
| -                                                                                                                                  | :ok: | (Ruby) `driver.execute_script 'flutter:launchApp', 'bundleId', {arguments: ['arg1'], environment: {ENV1: 'env'}}` | Flutter Driver    |
| dragAndDropWithCommandExtension                                                                                                    | :ok: | (Python) `driver.execute_script('flutter:dragAndDropWithCommandExtension', payload)` | Command Extension |

**NOTE**
>`flutter:launchApp` launches an app via instrument service. `mobile:activateApp` and `driver.activate_app` are via XCTest API. They are a bit different.


### `isolate` handling
#### Change the flutter engine attache to

1. Get available isolate ids
    - `id` key in the value of `isolates` by `flutter:getVMInfo`
2. Set the id via `setIsolateId`

```ruby
# ruby
info = driver.execute_script 'flutter:getVMInfo'
# Change the target engine to "info['isolates'][0]['id']"
driver.execute_script 'flutter:setIsolateId', info['isolates'][0]['id']
```

#### Check current isolate, or a particular isolate

1. Get available isolates
    - `driver.execute('flutter:getVMInfo').isolates` (JS)
2. Get a particular isolate or current isolate
    - Current isolate: `driver.execute('flutter:getIsolate')` (JS)
    - Particular isolate: `driver.execute('flutter:getIsolate', 'isolates/2978358234363215')` (JS)

## Commands across contexts

These Appium commands can work across context

- `deleteSession`
- `setContext`
- `getCurrentContext`
- `getContexts`
- `activateApp('appId')`/`mobile:activateApp`
    - `mobile:activateApp` has `skipAttachObservatoryUrl` key to not try to attach to an observatory url. e.g. `driver.execute_script 'mobile:activateApp', {skipAttachObservatoryUrl: true, appId: 'com.android.chrome'}`
- `terminateApp('appId')`/`mobile:terminateApp`
- `installApp(appPath, options)`
- `getClipboard`
- `setClipboard`

## Command Extension (Flutter Driver)

This is a command extension for Flutter Driver, utilizing the [CommandExtension-class](https://api.flutter.dev/flutter/flutter_driver_extension/CommandExtension-class.html) within `ext.flutter.driver`

Available commands:

- `dragAndDropWithCommandExtension` – performs a drag-and-drop action on the screen by specifying the start and end coordinates and the action duration.
- `getTextWithCommandExtension` - get text data from Text widget that contains TextSpan widgets. 

### How to use

Copy the sample dart files to the `lib` folder of your project. Please note that you don't need to copy all files, just copy the file matched with the command you need.
- dragAndDropWithCommandExtension: [drag_commands.dart](./example/dart/drag_commands.dart)
- getTextWithCommandExtension: [get_text_command.dart](./example/dart/get_text_command.dart) 

The entry point must include the `List<CommandExtension>?` commands argument in either `main.dart` or `test_main.dart` to properly handle the command extension.


```dart
import 'drag_commands.dart';
import 'get_text_command.dart';

void main() {
  enableFlutterDriverExtension(
      commands: [DragCommandExtension(), GetTextCommandExtension()]);
  runApp(const MyApp());
}
```

#### Simple examples in Python

```python
# Extended commands: flutter:dragAndDropWithCommandExtension
coord_item_1 = driver.execute_script("flutter:getCenter", item_1)
coord_item_2 = driver.execute_script("flutter:getCenter", item_2)
start_x = coord_item_1["dx"]
start_y = coord_item_1["dy"]
end_y = coord_item_2["dy"]

payload = {
    "startX": start_x,
    "startY": start_y,
    "endX": "0",
    "endY": end_y,
    "duration": "15000" # minimum 15000ms needed to drag n drop
}

driver.execute_script("flutter:dragAndDropWithCommandExtension", payload)

# Extended commands: flutter:getTextWithCommandExtension
text_finder = finder.by_value_key('amount')
get_text_payload = {
    'findBy': text_finder,
}
result = driver.execute_script('flutter:getTextWithCommandExtension', payload)
print(result)
```

#### Simple examples in nodejs

```typescript
// Extended commands: flutter:dragAndDropWithCommandExtension
const payload = {
  "startX": "100",
  "startY": "100",
  "endX": "100",
  "endY": "600",
  "duration": "15000"
}
const result = await driver.execute("flutter:dragAndDropWithCommandExtension", payload);
console.log(JSON.stringify(result));

// Extended commands: flutter:getTextWithCommandExtension
import {byValueKey} from "appium-flutter-finder";
const payload = {
    'findBy': byValueKey('amount'),
  };
const getTextResult = await driver.execute('flutter:getTextWithCommandExtension', payload);
console.log(JSON.stringify(getTextResult));

```

For debugging or testing in other programming languages, you can use the APK available in this [repository](https://github.com/Alpaca00/command-driven-list) or build an IPA.


## Troubleshooting

- Input texts https://github.com/appium/appium-flutter-driver/issues/417
- Looks hanging in `click` https://github.com/appium/appium-flutter-driver/issues/181#issuecomment-1323684510
    - `flutter:setFrameSync` may help
- `flutter:waitFor` would help to handle "an element does not exist/is not enabled" behavior. [exmaple issue](https://github.com/appium/appium-flutter-driver/issues/693)
- Appium Inspector does not work with FLUTTER context

## TODO?

- [ ] switching context between Flutter and [AndroidView](https://api.flutter.dev/flutter/widgets/AndroidView-class.html)
- [ ] switching context between Flutter and [UiKitView](https://api.flutter.dev/flutter/widgets/UiKitView-class.html)
- [ ] Web: `FLUTTER_WEB` context?
- [ ] macOS: with https://github.com/appium/appium-mac2-driver
- [ ] Windws?
- [ ] Linux?

## Release appium-flutter-driver

```
$ cd driver
$ sh release.sh
$ npm version <major|minor|patch>
# update changelog
$ git commit -am 'chore: bump version'
$ git tag <version number> # e.g. git tag v0.0.32
$ git push origin v0.0.32
$ git push origin main
$ npm publish
```

### Java implementation

- https://github.com/appium/appium-flutter-driver/tree/main/finder/kotlin via jitpack
- https://github.com/ashwithpoojary98/javaflutterfinder
- https://github.com/5v1988/appium-flutter-client

