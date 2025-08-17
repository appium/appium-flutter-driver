# Changelog

## 2.19.0
- Update Appium UIAutomator2 driver dependency to 4.2.9
- Update Appium XCUITest driver dependency to 9.10.5

## 2.18.1/2.18.0
- Update Appium UIAutomator2 driver dependency to 4.2.4
- Update Appium XCUITest driver dependency to 9.9.1
    - Supports `appium driver run flutter download-wda-sim` command. It requires NodeJS 20+.

## 2.17.0
- Fix ending forwarding port with `forwardingPort` capability on iOS with `terminateApp`
- Update Appium XCUITest driver dependency to 9.6.1

## 2.16.0
- Added shortcut commands below. Please check the README about the usage.
    - `flutter:assertVisible`
    - `flutter:assertNotVisible`
    - `flutter:assertTappable`
- Update Appium XCUITest driver dependency to 9.2.5

## 2.15.2
- Fix device orientation change for iOS
- Update Appium XCUITest driver dependency to 9.2.4

## 2.15.1
- Add a retry logic to check `ext.flutter.driver` module existence

## 2.15.0
- Update Appium UIAutomator2 driver dependency to 4.2.3
- Update Appium XCUITest driver dependency to 9.2.3

## 2.14.2
- Fix package to include npm-shrinkwrap.json explicitly
- Update Appium UIAutomator2 driver dependency to 4.1.1
- Update Appium XCUITest driver dependency to 8.4.1

## 2.14.1
- Fix lint

## 2.14.0
- Update Appium UIAutomator2 driver dependency to 4.0.3
- Update Appium XCUITest driver dependency to 8.3.2

## 2.13.0
- Update Appium XCUITest driver dependency to 8.1.0

## 2.12.0
- Update Appium UIAutomator2 driver dependency to 3.10.0
- Update Appium XCUITest driver dependency to 7.35.1

## 2.11.0
- Adds `flutter:getTextWithCommandExtension` command. Please check the README about how to use the command properly.
- Update Appium UIAutomator2 driver dependency to 3.9.1
- Update Appium XCUITest driver dependency to 7.32.0

## 2.10.0
- Adds `flutter:dragAndDropWithCommandExtension` command. Please check the README about how to use the command properly.
- Update Appium UIAutomator2 driver dependency to 3.8.1
- Update Appium XCUITest driver dependency to 7.28.3

## 2.9.2
- Fix observatory url finding after an app activation
    - Bring `appium:maxRetryCount` and `appium:retryBackoffTime` back to use for the observaotry url findings.

## 2.9.0 (2.9.1)
- Tune syslog scanning to find the observatory url
    - Drop `appium:maxRetryCount` and `appium:retryBackoffTime` as no usage
- Update Appium UIAutomation2 driver dependency to 3.7.4
- Update XCUITest driver dependency to 7.24.1

## 2.8.0
- Support `getWidgetDiagnostics`

## 2.7.1
- add logs around set context

## 2.7.0
- Update Appium UIAutomation2 driver dependency to 3.5.4
- Update Appium XCUITest driver dependency to 7.17.5

## 2.6.0
- Update Appium XCUITest driver dependency to 7.11.1
- `doctor` command can skip Android or iOS with environment variables

## 2.5.1
- fix: scroll until visible + scroll until tapable [#671](https://github.com/appium/appium-flutter-driver/pull/671)

## 2.5.0
- Update Appium XCUITest driver dependency to 6.0.1

## 2.4.2
- Removed unused dependencies

## 2.4.1
- Removed unused dependencies

## 2.4.0
- Update Appium UIAutomation2 driver dependency to 2.42.1
- Update Appium XCUITest driver dependency to 5.14.0
- Add `doctor` command

## 2.3.0
- Update Appium UIAutomation2 driver dependency to 2.37.0
- Update Appium XCUITest driver dependency to 5.12.1

## 2.2.3
- fix leftover portforward

## 2.2.2
- fix: scrollUntilVisible and scrollUntilTapable https://github.com/appium/appium-flutter-driver/pull/622

## 2.2.1
- fix: typescript syntaxes

## 2.2.0
- Update Appium UIAutomation2 driver dependency to 2.34.1
- Update Appium XCUITest driver dependency to 5.7.0

## 2.1.0
- Update Appium XCUITest driver dependency to 5.6.0

## 2.0.0
- Update Appium XCUITest driver dependency to 5.2.0. It supports iOS 15+.

## 1.23.0
- try the latest observatory url every attempt in connectSocket

## 1.22.0
- `skipAttachObservatoryUrl` option for `mobile:activateApp` to prevent trying to attach to an observatory url after activating the app.

## 1.21.1
- `appium:maxRetryCount` is 10 by default as optimization

## 1.21.0

- Add `isolateId` capability to configure it

## 1.20.2 (1.20.0, 1.20.1 had broken lock file)
- Add `adbPort`, `remoteAdbHost` and `forwardingPort` support

## 1.19.1
- Use XCUITest driver: 4.31.0
   - Last iOS 14 and lower one work version

## 1.19.0
- Add `flutter:launchApp` to start an app via instrument service natively for iOS

## 1.18.1
- Keep using XCUITest driver v4.27.0 for iOS versions lower than 15.

## 1.18.0
- Add `flutter:connectObservatoryWsUrl` command to observe the url in the middle

## 1.17.1
- Make `mobile:activateApp` and `mobile:terminateApp` behavior same as `activateApp` and `terminateApp`

## 1.17.0
- Proxy device orientation api to NATIVE_APP context

## 1.16.0
- Update dependencies
    - UIA2 driver: 2.29.2
    - XCUITest driver: 4.32.19
- Added `clickElement` as execute script. It is the same as other `tap` commands
- Update `peerDependencies` as Appium 2.0

## 1.15.0
- Update dependencies such as UIA2/XCUITest drivers

## 1.14.4
- Fix element parsing for w3c element

## 1.14.2, 1.14.3 (the same)
- Add debug log when an exception occurred in the observatory url finding

## 1.14.1
- Bump the UIA2 version

## 1.14.0
- Fix proxyCommand for plugins [#425](https://github.com/appium-userland/appium-flutter-driver/pull/425)
- Fix startNewCommandTimeout call [#426](https://github.com/appium-userland/appium-flutter-driver/pull/426)

## 1.13.1
- Fix no `waitTimeoutMilliseconds` argument case for scrollUntilVisible/scrollUntilTapable

## 1.13.0
- Add arguments in scrollUntilVisible/scrollUntilTapable
    - `waitTimeoutMilliseconds`: The timeout to try scroll up to the timeout
    - `durationMilliseconds`: The duration to do a scroll action. `timeout` in [scroll](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scroll.html).
    - `frequency`: The frequency to for the move events in  [scroll](https://api.flutter.dev/flutter/flutter_driver/FlutterDriver/scroll.html).


## 1.12.0
- Support `setClipboard` and `getClipboard` by always proxying the request to the NATIVE_APP context
- Support non-`app` and non-`bundleId` nor non-`appPackage` session starts as `FLUTTER` context
- Add `installApp` to install the test target after the new session request

## 1.11.0
- Add `activateApp` support to start an app

## 1.10.0
- Add `terminateApp` support to stop the running application
    - The behavior is the same as when you call the same endpoint in NATIVE_APP context

## 1.9.1
- Improved error message when no observatory url found

## 1.9.0
- **Breaking change**
    - Revert [#306](https://github.com/appium-userland/appium-flutter-driver/pull/306) (added in v1.5.0). `scrollUntilVisible` uses `waitFor` as same as before v1.5.0.
        - Please use `scrollUntilTapable` instead since this version
 - Added `scrollUntilTapable` command to scroll with `waitForTappable` [#360](https://github.com/appium-userland/appium-flutter-driver/pull/360)

## 1.8.0

Appium `2.0.0-beta.46` and higher is needed as dependencies update in dependent Appium UIA2/XCUITest drivers

- Added `timeout` argument for scrollIntoView [#358](https://github.com/appium-userland/appium-flutter-driver/pull/358)
- Added `skipPortForward` capability [#343](https://github.com/appium-userland/appium-flutter-driver/pull/343)

## 1.7.2 (1.7.1)
- Fixed `* 1000` in `scroll` [#330](https://github.com/appium-userland/appium-flutter-driver/pull/330)

## 1.7.0
- **Breaking change**
    - Do not calculate `* 1000` internally for milliseconds arguments to set them properly as same as README/examples. [#319](https://github.com/appium-userland/appium-flutter-driver/issues/319)

## 1.6.0
- Update for newer Appium 2 beta

## 1.5.0

- Use `waitForTappable` in `scrollUntilVisible` [#306](https://github.com/appium-userland/appium-flutter-driver/pull/306)

## 1.4.0

- Added `flutter:getIsolate` to get the isolate information [#298](https://github.com/appium-userland/appium-flutter-driver/pull/298)

## 1.3.0

- Added `flutter:getVMInfo` and `flutter:setIsolateId` commands to allow a session to switch the target isolate id [#292](https://github.com/appium-userland/appium-flutter-driver/pull/292)

## 1.2.0

- Added `waitForTappable` [#289](https://github.com/appium-userland/appium-flutter-driver/pull/289)

## 1.1.2 (1.1.1)

- Fixed checking observatory URL every trial [#287](https://github.com/appium-userland/appium-flutter-driver/pull/287)

## 1.1.0

- Support processLogToGetobservatory for Flutter >= 3.0.0 [#283](https://github.com/appium-userland/appium-flutter-driver/pull/283)
