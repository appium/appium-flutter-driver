# Appium Flutter Finder

Companion `finder` for [Appium Flutter Driver](https://www.npmjs.com/package/appium-flutter-driver), that mimics the API of Flutter Driver's [CommonFinders class](https://api.flutter.dev/flutter/flutter_driver/CommonFinders-class.html). All documentation and examples are available in [Appium Flutter Driver package](https://www.npmjs.com/package/appium-flutter-driver).

# Release

```
$ cd finder/nodejs
$ npm version <major|minor|patch>
$ git commit -am 'chore: bump version'
$ git tag js-finder-<version number> # e.g. git tag js-finder-0.0.23
$ git push origin js-finder-0.0.23
$ npm publish
```

## Changelog
- 0.2.0
    - Fix type of `matchRoot` and `firstMatchOnly` in `ancestor` and `descendant`
- 0.1.0
  - Add `firstMatchOnly` in `ancestor` and `descendant`
- 0.0.23
  - Fix `ancestor` and `descendant`
