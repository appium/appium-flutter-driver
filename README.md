# Appium Flutter Driver

[![NPM version](https://img.shields.io/npm/v/appium-flutter-driver.svg)](https://npmjs.org/package/appium-flutter-driver)
[![Downloads](https://img.shields.io/npm/dm/appium-flutter-driver.svg)](https://npmjs.org/package/appium-flutter-driver)

Appium Flutter Driver is a test automation tool for [Flutter](https://flutter.dev) apps on multiple platforms/OSes. Appium Flutter Driver is part of the [Appium](https://github.com/appium/appium) mobile test automation tool maintained by community. Feel free to create PRs to fix issues/improve this driver.

This package is still experiment, breaking changes and breaking codes are to be expected! All contributions, including non-code, are welcome! See [TODO](#todo) list below.

## Flutter Driver vs Appium Flutter Driver
Even though Flutter comes with superb integration test support, [Flutter Driver](https://flutter.dev/docs/cookbook/testing/integration/introduction), it does not fit some specific use cases, such as
- writing test in other languages than Dart
- running integration test for Flutter app with embedded webview or native view, or existing native app with embedded Flutter view
- running test on multiple devices simultaneously
- running integration test on device farms, such as Sauce Labs, HeadSpin, AWS, Firebase

Under the hood, Appium Flutter Driver use the [Dart VM Service Protocol](https://github.com/dart-lang/sdk/blob/master/runtime/vm/service/service.md) with extension `ext.flutter.driver`, similar to Flutter Driver, to control the Flutter app-under-test (AUT).

## Installation

In order to use `appium-flutter-driver`, we need to use `appium` version `1.16.0` or higher.
The version 1.0.0 and higher requires Appium 2.0.

With Appium 2 (`appium@next`):
```
appium driver install flutter
```

> **Note**
> Please use the latest flutter driver with appium 2 for Flutter v3


With Appium 1:

```
npm i -g appium-flutter-driver
```

## Usage
If you are unfamiliar with running Appium tests, start with [Appium Getting Starting](http://appium.io/docs/en/about-appium/getting-started/) first.

Your Flutter app-under-test (AUT) must be compiled in `debug` or `profile` mode, because `Flutter Driver does not support running in release mode.`. Also, ensure that your Flutter AUT has `enableFlutterDriverExtension()` before `runApp`. Then, please make sure your app imported **[`flutter_driver`](https://api.flutter.dev/flutter/flutter_driver/flutter_driver-library.html)** package as its devDependencies as well.

This snippet, taken from [example dir](https://github.com/appium-userland/appium-flutter-driver/tree/main/example), is a script written as an appium client with `webdriverio`, and assumes you have `appium` server (with `appium-flutter-driver` installed) running on the same host and default port (`4723`). For more info, see example's [README.md](https://github.com/truongsinh/appium-flutter-driver/tree/main/example/README.md)

### Desired Capabilities for flutter driver only

| Capability | Description | Example Values |
| - | - | -|
| appium:retryBackoffTime | The time wait for socket connection retry for get flutter session (default 3000ms)|500|
| appium:maxRetryCount    | The count for socket connection retry for get flutter session (default 30)          | 20|
| appium:observatoryWsUri | The URL to attach to the Dart VM. The appium flutter driver finds the WebSocket URL from the device log by default. You can skip the finding the URL process by specifying this capability. Then, this driver attempt to establish a WebSocket connection against the given WebSocket URL. Note that this capability espects the URL is ready for access by outside an appium session. This flutter driver does not do port-forwarding with this capability. You may need to coordinate the port-forwarding as well. | 'ws://127.0.0.1:60992/aaaaaaaaaaa=/ws' |
| appium:skipPortForward | Whether skip port forwarding from the flutter driver local to the device under test with `observatoryWsUri` capability. It helps you to manage the application under test, the observatory URL and the port forwarding configuration. The default is `true`. | true, false |

### Context

Appium Flutter Driver allow you to send flutter_driver commands to the Dart VM in `FLUTTER` context, but it does not support native Android/iOS automation. Instead, `NATIVE_APP` context provide you to use UIA2 drier for Android and XCUITest for iOS automation. `WEBVIEW_XXXX` cntext helps WebView testing.

Thus, you can automate proper application target by switching its context with `FLUTTER`, `NATIVE_APP` and `WEBVIEW_XXXX`.

### Example

```js
const wdio = require('webdriverio');
const assert = require('assert');
const { byValueKey } = require('appium-flutter-finder');

const osSpecificOps = process.env.APPIUM_OS === 'android' ? {
  'platformName': 'Android',
  'appium:deviceName': 'Pixel 2',
  // @todo support non-unix style path
  app: __dirname +  '/../apps/app-free-debug.apk',
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

## Changelog

- [appium-flutter-driver](driver/CHANGELOG.md)
- [each finder](finder)

## API

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
| [byValueKey](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/byValueKey.html) | :ok: | [`byValueKey('counter')`](https://github.com/truongsinh/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L30) |
| [descendant](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/descendant.html) | :ok: |  |
| [pageBack](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/pageBack.html) | :ok: | `pageBack()` |
| [text](https://api.flutter.dev/flutter/flutter_driver/CommonFinders/text.html) | :ok: | `byText('foo')` |

### Commands

The below _WebDriver example_ is by webdriverio.
`flutter:` prefix commands are [`mobile:` command in appium for Android and iOS](https://appium.io/docs/en/commands/mobile-command/).
Please replace them properly with your client.

| Flutter API | Status | WebDriver example (JavaScript, webdriverio) | Scope |
| - | - | - | - |
| [FlutterDriver.connectedTo](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/FlutterDriver.connectedTo.html) | :ok: | [`wdio.remote(opts)`](https://github.com/truongsinh/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L33) | Session |
| [checkHealth](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/checkHealth.html) | :ok: | `driver.execute('flutter:checkHealth')` | Session |
| clearTextbox | :ok: | `driver.elementClear(find.byType('TextField'))` | Session |
| [clearTimeline](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/clearTimeline.html) | :ok: | `driver.execute('flutter:clearTimeline')` | Session |
| [close](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/close.html) | :ok: | [`driver.deleteSession()`](https://github.com/truongsinh/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L55) | Session |
| [enterText](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/enterText.html) | :ok: | `driver.elementSendKeys(find.byType('TextField'), 'I can enter text')` (no focus required) <br/> `driver.elementClick(find.byType('TextField')); driver.execute('flutter:enterText', 'I can enter text')` (focus required by tap/click first) | Session |
| [forceGC](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/forceGC.html) | :ok: | `driver.execute('flutter:forceGC')` | Session |
| [getBottomLeft](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getBottomLeft.html) | :ok: | `driver.execute('flutter:getBottomLeft', buttonFinder)` | Widget |
| [getBottomRight](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getBottomRight.html) | :ok: | `driver.execute('flutter:getBottomRight', buttonFinder)` | Widget |
| [getCenter](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getCenter.html) | :ok: | `driver.execute('flutter:getCenter', buttonFinder)` | Widget |
| [getRenderObjectDiagnostics](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getRenderObjectDiagnostics.html) | :ok: | `driver.execute('flutter:getRenderObjectDiagnostics', counterTextFinder)` | Widget |
| [getRenderTree](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getRenderTree.html) | :ok: | `driver.execute('flutter: getRenderTree')` | Session |
| [getSemanticsId](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getSemanticsId.html) | :ok: | `driver.execute('flutter:getSemanticsId', counterTextFinder)` | Widget |
| [getText](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getText.html) | :ok: | [`driver.getElementText(counterTextFinder)`](https://github.com/truongsinh/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L44) | Widget |
| [getTopLeft](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getTopLeft.html) | :ok: | `driver.execute('flutter:getTopLeft', buttonFinder)` | Widget |
| [getTopRight](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getTopRight.html) | :ok: | `driver.execute('flutter:getTopRight', buttonFinder)` | Widget |
| [getVmFlags](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getVmFlags.html) | :x: |  | Session |
| [getWidgetDiagnostics](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/getWidgetDiagnostics.html) | :x: |  | Widget |
| [requestData](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/requestData.html) | :ok: | `driver.execute('flutter:requestData', json.dumps({"deepLink": "myapp://item/id1"}))`  | Session |
| [runUnsynchronized](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/runUnsynchronized.html) | :x: |  | Session |
| [setFrameSync](https://api.flutter.dev/flutter/flutter_driver/SetFrameSync-class.html) |:ok:| `driver.execute('flutter:setFrameSync', bool , durationMilliseconds)`| Session |
| [screenshot](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/screenshot.html) | :ok: | `driver.takeScreenshot()` | Session |
| [screenshot](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/screenshot.html) | :ok: | `driver.saveScreenshot('a.png')` | Session |
| [scroll](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scroll.html) | :ok: | `driver.execute('flutter:scroll', find.byType('ListView'), {dx: 50, dy: -100, durationMilliseconds: 200, frequency: 30})` | Widget |
| [scrollIntoView](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scrollIntoView.html) | :ok: | `driver.execute('flutter:scrollIntoView', find.byType('TextField'), {alignment: 0.1})` | Widget |
| [scrollUntilVisible](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scrollUntilVisible.html) | :ok: | `driver.execute('flutter:scrollUntilVisible', find.byType('ListView'), {item:find.byType('TextField'), dxScroll: 90, dyScroll: -400});` | Widget |
| [setSemantics](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/setSemantics.html) | :x: |  | Session |
| [setTextEntryEmulation](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/setTextEntryEmulation.html) | :ok: | `driver.execute('flutter:setTextEntryEmulation', false)` | Session |
| [startTracing](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/startTracing.html) | :x: |  | Session |
| [stopTracingAndDownloadTimeline](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/stopTracingAndDownloadTimeline.html) | :x: |  | Session |
| [tap](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/tap.html) | :ok: | [`driver.elementClick(buttonFinder)`](https://github.com/truongsinh/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L46) | Widget |
| [tap](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/tap.html) | :ok: | [`driver.touchAction({action: 'tap', element: {elementId: buttonFinder}})`](https://github.com/truongsinh/appium-flutter-driver/blob/5df7386b59bb99008cb4cff262552c7259bb2af2/example/src/index.js#L47) | Widget |
| [traceAction](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/traceAction.html) | :x: |  | Session |
| [waitFor](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitFor.html) | :ok: | `driver.execute('flutter:waitFor', buttonFinder, 100)` | Widget |
| [waitForAbsent](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitForAbsent.html) | :ok: | `driver.execute('flutter:waitForAbsent', buttonFinder)` | Widget |
| [waitForTappable](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitForTappable.html) | :ok: | `driver.execute('flutter:waitForTappable', buttonFinder)` | Widget |
| [waitUntilNoTransientCallbacks](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/waitUntilNoTransientCallbacks.html) | :x: |  | Widget |
| - | :ok: | `driver.execute('flutter:getVMInfo')` | System |
| - | :ok: | `driver.execute('flutter:setIsolateId', 'isolates/2978358234363215')` | System |
| - | :ok: | `driver.execute('flutter:getIsolate', 'isolates/2978358234363215')` or `driver.execute('flutter:getIsolate')` | System |
| - | :ok: | `setContext` | Appium |
| - | :ok: | `getCurrentContext` | Appium |
| - | :ok: | `getContexts` | Appium |
| :question: | :ok: | `driver.execute('flutter:longTap', find.byValueKey('increment'), {durationMilliseconds: 10000, frequency: 30})` | Widget |
| :question: | :ok: | `driver.execute('flutter:waitForFirstFrame')` | Widget |

### Note
- Flutter context does not support page source
    - Please use `getRenderTree` command instead
- You can send appium-xcuitest-driver/appium-uiautomator2-driver commands in `NATIVE_APP` context

## Change the flutter engine attache to

1. Get available isolate ids
    - `id` key in the value of `isolates` by `flutter:getVMInfo`
2. Set the id via `setIsolateId`

```ruby
# ruby
info = driver.execute_script 'flutter:getVMInfo'
# Change the target engine to "info['isolates'][0]['id']"
driver.execute_script 'flutter:setIsolateId', info['isolates'][0]['id']
```

## Check current isolate, or a particular isolate

1. Get available isolates
    - `driver.execute('flutter:getVMInfo').isolates` (JS)
2. Get a particular isolate or current isolate
    - Current isolate: `driver.execute('flutter:getIsolate')` (JS)
    - Particular isolate: `driver.execute('flutter:getIsolate', 'isolates/2978358234363215')` (JS)

## TODO
- [ ] CI (unit test / integration test with demo app)
- [ ] CD (automatic publish to npm)
- [ ] switching context between Flutter and [AndroidView](https://api.flutter.dev/flutter/widgets/AndroidView-class.html)
- [ ] switching context between Flutter and [UiKitView](https://api.flutter.dev/flutter/widgets/UiKitView-class.html)
- [ ] Flutter-version-aware API
- [ ] Error handling

## Test Status

## Release appium-flutter-driver

```
$ cd driver
$ rm npm-shrinkwrap.json
$ npm run clean-dependency
$ npm prune --production
$ rm -rf node_modules/appium
$ npm shrinkwrap  # to specify the dependencies in the npm module
$ npm version <major|minor|patch>
$ git commit -am 'chore: bump version'
$ git tag <version number> # e.g. git tag v0.0.32
$ git push origin v0.0.32
$ git push origin main
$ npm publish
```

### Java implementation
````
https://github.com/ashwithpoojary98/javaflutterfinder
