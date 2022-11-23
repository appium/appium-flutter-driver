# !/bin/sh

echo "refreshing dependencies"
rm npm-shrinkwrap.json
npm run clean-dependency
npm prune --production
rm -rf node_modules/appium
npm shrinkwrap

echo "complete the refreshment"

