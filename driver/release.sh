# !/bin/sh

echo "refreshing dependencies"
rm npm-shrinkwrap.json
APPIUM_SKIP_CHROMEDRIVER_INSTALL=1 npm run clean-dependency
npm prune --production
rm -rf node_modules/appium
npm shrinkwrap

echo "complete the refreshment"
