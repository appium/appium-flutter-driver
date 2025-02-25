import {services, INSTRUMENT_CHANNEL} from 'appium-ios-device';
import { log } from './../logger';

/**
 * Launch the given bundle id via instrument service.
 */
export const launchApp = async (udid: string, bundleId: string, args = [], env = {}): Promise<boolean> => {
  let instrumentService;
  try {
    instrumentService = await services.startInstrumentService(udid);
    log.info(`Launching app ${bundleId} with arguments ${JSON.stringify(args)} and env ${JSON.stringify(env)} on device ${udid}`);
    await instrumentService.callChannel(
      INSTRUMENT_CHANNEL.PROCESS_CONTROL,
      'launchSuspendedProcessWithDevicePath:bundleIdentifier:environment:arguments:options:',
      '',
      bundleId,
      env,
      args,
      {'StartSuspendedKey': 0, 'KillExisting': 1}
    );
    return true;
  } catch (err) {
    log.warn(`Failed to launch '${bundleId}'. Original error: ${err.stderr || err.message}`);
    return false;
  } finally {
    if (instrumentService) {
      instrumentService.close();
    }
  }
};
