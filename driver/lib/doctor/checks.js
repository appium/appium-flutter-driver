import { doctor as androidDoctor } from "appium-android-driver";
import { doctor as iosDoctor } from "appium-xcuitest-driver";


export const androidHomeCheck = androidDoctor.androidHomeCheck;
export const javaHomeCheck = androidDoctor.javaHomeCheck;
export const javaHomeValueCheck = androidDoctor.javaHomeValueCheck;
export const androidSdkCheck = androidDoctor.androidSdkCheck;
export const optionalBundletoolCheck = androidDoctor.optionalBundletoolCheck;
export const optionalGstreamerCheck = androidDoctor.optionalGstreamerCheck;

export const xcodeCheck = iosDoctor.required.xcodeCheck;
export const xcodeToolsCheck = iosDoctor.required.xcodeToolsCheck;
export const envVarAndPathCheck = iosDoctor.required.envVarAndPathCheck;
export const homeEnvVarCheck = iosDoctor.required.homeEnvVarCheck;
export const optionalIdbCommandCheck = iosDoctor.optional.optionalIdbCommandCheck;
export const optionalApplesimutilsCommandCheck = iosDoctor.optional.optionalApplesimutilsCheck;


// shared
export const optionalFfmpegCheck = androidDoctor.optionalFfmpegCheck;
