// TODO: Please revert '@appium/support' to 'appium/support.js' and "@appium/support" dependency
// in Appium 3 based version
import {fs, logger, zip, net, node} from '@appium/support';
import _ from 'lodash';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const log = logger.getLogger('download-wda-sim');
const wdaUrl = (version, zipFileName) =>
  `https://github.com/appium/WebDriverAgent/releases/download/v${version}/${zipFileName}`;
const destZip = (platform) => {
  const scheme = `WebDriverAgentRunner${_.toLower(platform) === 'tvos' ? '_tvOS' : ''}`;
  return `${scheme}-Build-Sim-${os.arch() === 'arm64' ? 'arm64' : 'x86_64'}.zip`;
};

/**
 * Get the value of the given argument name.
 *
 * @param {string} argName
 * @returns {string?} The value of the given 'argName'.
 */
export function parseArgValue(argName) {
  const argNamePattern = new RegExp(`^--${argName}\\b`);
  for (let i = 1; i < process.argv.length; ++i) {
    const arg = process.argv[i];
    if (argNamePattern.test(arg)) {
      return arg.includes('=') ? arg.split('=')[1] : process.argv[i + 1];
    }
  }
  return null;
}

/**
 * Return installed appium-webdriveragent package version
 * @returns {number}
 */
async function webdriveragentPkgVersion() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkgPath = path.join(
    node.getModuleRootSync('appium-flutter-driver', __dirname),
    'node_modules',
    'appium-xcuitest-driver',
    'node_modules',
    'appium-webdriveragent',
    'package.json'
  );
  return JSON.parse(await fs.readFile(pkgPath, 'utf8')).version;
};

/**
 * Prepare the working root directory.
 * @returns {string} Root directory to download and unzip.
 */
async function prepareRootDir() {
  const destDirRoot = parseArgValue('outdir');
  if (!destDirRoot) {
    throw new Error(`--outdir is required`);
  }
  const destDir = path.resolve(process.cwd(), destDirRoot);
  if (await fs.exists(destDir)) {
    throw new Error(`${destDir} already exists`);
  }
  await fs.mkdir(destDir, {recursive: true});
  return destDir;
}

async function getWDAPrebuiltPackage() {
  const destDir = await prepareRootDir();
  const platform = parseArgValue('platform');
  const zipFileName = destZip(platform);
  const wdaVersion = await webdriveragentPkgVersion();
  const urlToDownload = wdaUrl(wdaVersion, zipFileName);
  const downloadedZipFile = path.join(destDir, zipFileName);
  try {
    log.info(`Downloading ${urlToDownload}`);
    await net.downloadFile(urlToDownload, downloadedZipFile);

    log.info(`Unpacking ${downloadedZipFile} into ${destDir}`);
    await zip.extractAllTo(downloadedZipFile, destDir);

    log.info(`Deleting ${downloadedZipFile}`);
  } finally {
    if (await fs.exists(downloadedZipFile)) {
      await fs.unlink(downloadedZipFile);
    }
  }
}

(async () => await getWDAPrebuiltPackage())();
