import { doctor as androidDoctor } from 'appium-android-driver';
import { doctor as iosDoctor } from 'appium-xcuitest-driver';

// shared
export const homeEnvVarCheck = iosDoctor.required.homeEnvVarCheck;

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
let optionalIdbCommandCheck;
let optionalApplesimutilsCommandCheck;
if (!process.env.SKIP_IOS) {
  xcodeCheck = iosDoctor.required.xcodeCheck;
  xcodeToolsCheck = iosDoctor.required.xcodeToolsCheck;
  envVarAndPathCheck = iosDoctor.required.envVarAndPathCheck;
  optionalIdbCommandCheck = iosDoctor.optional.optionalIdbCommandCheck;
  optionalApplesimutilsCommandCheck = iosDoctor.optional.optionalApplesimutilsCheck;
}

// shared
export const optionalFfmpegCheck = androidDoctor.optionalFfmpegCheck;

export {
  androidHomeCheck, javaHomeCheck, javaHomeValueCheck, androidSdkCheck, optionalBundletoolCheck, optionalGstreamerCheck,
  xcodeCheck, xcodeToolsCheck, envVarAndPathCheck, optionalIdbCommandCheck, optionalApplesimutilsCommandCheck
};
