cd to ./driver, and run `npm link`

install Appium globally by running `npm i -g appium`

run appium server by running `appium`

create a dir called `apps`, and put example files as download from https://github.com/truongsinh/appium-flutter-driver/releases/tag/v0.0.4 into that dir:
- (Android) https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/android-real-debug.apk
- (iOS) https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/ios-sim-debug.zip

either run `APPIUM_OS=android npm start` or `APPIUM_OS=ios npm start`

TBD
