# Appium Flutter Finder

Companion `finder` for [Appium Flutter Driver](https://www.npmjs.com/package/appium-flutter-driver), that mimics the API of Flutter Driver's [CommonFinders class](https://api.flutter.dev/flutter/flutter_driver/CommonFinders-class.html). All documentation and examples are available in [Appium Flutter Driver package](https://www.npmjs.com/package/appium-flutter-driver).

## Convert `appium-flutter-finder` to ESM in 0.3.0

`appium-flutter-finder` is now published as an ESM-only package. CommonJS `require()` is no longer supported.

Before:

```js
const finder = require('appium-flutter-finder');
```

After:

```js
import * as finder from 'appium-flutter-finder';
```

Named imports are also supported:

```js
import {byText, byValueKey} from 'appium-flutter-finder';
```

CommonJS projects can use dynamic import:

```js
const finder = await import('appium-flutter-finder');
```

Deep imports from `appium-flutter-finder/build/...` are no longer supported. Import all public APIs from the package root.

# Release

```
$ cd finder/nodejs
$ npm version <major|minor|patch>
$ git commit -am 'chore: bump version of appium-flutter-finder'
$ git tag js-finder-<version number> # e.g. git tag js-finder-0.0.23
$ git push origin js-finder-0.0.23
$ git push origin main
```

## Changelog
- 0.3.0
  - Convert to ESM
- 0.2.1/0.2.2/0.2.3
  - Use ox as format/lint
- 0.2.0
  - Fix type of `matchRoot` and `firstMatchOnly` in `ancestor` and `descendant`
- 0.1.0
  - Add `firstMatchOnly` in `ancestor` and `descendant`
- 0.0.23
  - Fix `ancestor` and `descendant`
