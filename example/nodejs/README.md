# To run the automation locally

1. Make sure node and npm are installed locally
2. cd to ./driver
3. `npm install -g typescript` for typescript compile to work globally
4. `npm install` to install node modules 
5. run `npm link`
6. install Appium globally by running `npm i -g appium`
7. run appium server by running `appium` (in a seperate terminal)

8. create a dir called `apps`, and put example files as download from https://github.com/truongsinh/appium-flutter-driver/releases/tag/v0.0.4 into that dir:
- (Android) https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/android-real-debug.apk
- (iOS) https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/ios-sim-debug.zip

9. Modify the path for apk/ipa appropriately at https://github.com/appium-userland/appium-flutter-driver/blob/main/example/nodejs/src/index.js#L13

10. either run `APPIUM_OS=android npm start` or `APPIUM_OS=ios npm start`
