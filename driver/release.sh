# !/bin/sh

echo "refreshing dependencies"
rm npm-shrinkwrap.json
APPIUM_SKIP_CHROMEDRIVER_INSTALL=1 npm run clean-dependency
npm install --production
npm prune --production
rm -rf node_modules/appium
npm shrinkwrap

# to install types again
npm install

echo "complete the refreshment"
