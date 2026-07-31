import appiumConfig, {defineConfig, ignorePatterns} from '@appium/oxc-config/oxlint';

export default defineConfig({
  ...appiumConfig,
  ignorePatterns: [...ignorePatterns],
});
