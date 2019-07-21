'use strict';

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  typescript: true,
  build: 'appium-flutter-driver',
  watchE2E: true,
});
