# Appium Flutter Driver

[![Greenkeeper badge](https://badges.greenkeeper.io/truongsinh/appium-flutter-driver.svg)](https://greenkeeper.io/)
[![NPM version](http://img.shields.io/npm/v/appium-flutter-driver.svg)](https://npmjs.org/package/appium-flutter-driver)
[![Downloads](http://img.shields.io/npm/dm/appium-flutter-driver.svg)](https://npmjs.org/package/appium-flutter-driver)
[![Dependency Status](https://david-dm.org/truongsinh/appium-flutter-driver.svg)](https://david-dm.org/truongsinh/appium-flutter-driver)
[![devDependency Status](https://david-dm.org/truongsinh/appium-flutter-driver/dev-status.svg)](https://david-dm.org/truongsinh/appium-flutter-driver#info=devDependencies)

Appium Flutter Driver is a test automation tool for [Flutter](https://flutter.dev) apps on multiple platforms/OSes. Appium Flutter Driver is part of the [Appium](https://github.com/appium/appium) mobile test automation tool.

## :warning: pre-0.1.x version

This package is in early stage of exprienment, breaking changes and breaking codes are to be expected! All contributions, including non-code, are welcome! See [TODO](#todo) list below.

## Flutter Driver vs Appium Flutter Driver
Even though Flutter comes with superb integration test support, [Flutter Driver](https://flutter.dev/docs/cookbook/testing/integration/introduction), it does not fit some specific use cases, such as
- writing test in other languages than Dart
- running integration test for Flutter app with embedded webview or native view, or existing native app with embedded Flutter view
- running test on multiple devices simultanously
- running integration test on device farms, such as Sourcelab, AWS, Firebase

Under the hood, Appium Flutter Driver use the [Dart VM Service Protocol](https://github.com/dart-lang/sdk/blob/master/runtime/vm/service/service.md) with extension `ext.flutter.driver`, similar to Flutter Driver, to control the Flutter app-under-test (AUT).

## Installation

```
npm install appium-flutter-driver
```

## Usage
If you are unfamiliar with running Appium tests, start with [Appium Getting Starting](http://appium.io/docs/en/about-appium/getting-started/) first.

This snippet, taken from [example dir](https://github.com/truongsinh/appium-flutter-driver/tree/master/example), is a script written as an appium client with `webdriverio`, and assumes you have `appium` server (with `appium-flutter-driver` installed) running on the same host and default port (`4723`). For more info, see example's [README.md](https://github.com/truongsinh/appium-flutter-driver/tree/master/example/README.md)
```js
const wdio = require('webdriverio');
const assert = require('assert');
const { find } = require('./find');

const osSpecificOps = process.env.APPIUM_OS === 'android' ? {
  platformName: 'Android',
  deviceName: 'Pixel 2',
  // @todo support non-unix style path
  app: __dirname +  '/../apps/app-free-debug.apk',
}: process.env.APPIUM_OS === 'ios' ? {
  platformName: 'iOS',
  platformVersion: '12.2',
  deviceName: 'iPhone X',
  noReset: true,
  app: __dirname +  '/../apps/Runner.app',

} : {};

const opts = {
  port: 4723,
  capabilities: {
    ...osSpecificOps,
    automationName: 'Flutter'
  }
};

(async () => {
  const counterTextFinder = find.byValueKey('counter');
  const buttonFinder = find.byValueKey('increment');

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

## Commands
Context:
- `getCurrentContext`
- `setContext`
- `getContext`

Element:
- `getText`

Gesture:
- `click`
- `tapEl`
- `tap`
- `performTouch`

# TODO
TBD
