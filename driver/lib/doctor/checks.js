import {doctor as androidDoctor} from 'appium-android-driver';
import {doctor as iosDoctor} from 'appium-xcuitest-driver';

// shared
export const homeEnvVarCheck = /** @type {any} */ (iosDoctor.required.homeEnvVarCheck);

let androidHomeCheck;
let javaHomeCheck;
let javaHomeValueCheck;
let androidSdkCheck;
let optionalBundletoolCheck;
let optionalGstreamerCheck;
if (!process.env.SKIP_ANDROID) {
  androidHomeCheck = androidDoctor.androidHomeCheck;
  javaHomeCheck = androidDoctor.javaHomeCheck;
  javaHomeValueCheck = androidDoctor.javaHomeValueCheck;
  androidSdkCheck = androidDoctor.androidSdkCheck;
  optionalBundletoolCheck = androidDoctor.optionalBundletoolCheck;
  optionalGstreamerCheck = androidDoctor.optionalGstreamerCheck;
}

let xcodeCheck;
let xcodeToolsCheck;
let envVarAndPathCheck;
let optionalApplesimutilsCommandCheck;
if (!process.env.SKIP_IOS) {
  xcodeCheck = iosDoctor.required.xcodeCheck;
  xcodeToolsCheck = iosDoctor.required.xcodeToolsCheck;
  envVarAndPathCheck = /** @type {any} */ (iosDoctor.required.homeEnvVarCheck);
  optionalApplesimutilsCommandCheck = iosDoctor.optional.optionalApplesimutilsCheck;
}

// shared
export const optionalFfmpegCheck = androidDoctor.optionalFfmpegCheck;

export {
  androidHomeCheck,
  javaHomeCheck,
  javaHomeValueCheck,
  androidSdkCheck,
  optionalBundletoolCheck,
  optionalGstreamerCheck,
  xcodeCheck,
  xcodeToolsCheck,
  envVarAndPathCheck,
  optionalApplesimutilsCommandCheck,
};
