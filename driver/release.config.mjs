import releaseConfig from '@appium/semantic-release-config';

export default releaseConfig({
  extraGitAssets: ['npm-shrinkwrap.json'],
});
