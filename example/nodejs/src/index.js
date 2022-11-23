// import * as wdio from 'webdriverio';
// import * as assert from 'assert';
const wdio = require('webdriverio');
const assert = require('assert');
const find = require('appium-flutter-finder');

const osSpecificOps =
  process.env.APPIUM_OS === 'android'
    ? {
        'appium:platformName': 'Android',
        'appium:deviceName': 'Pixel 2',
        // @todo support non-unix style path
        'appium:app': __dirname + '/../../apps/android-real-debug.apk' // download local to run faster and save bandwith
        // app: 'https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/android-real-debug.apk',
      }
    : process.env.APPIUM_OS === 'ios'
    ? {
        'appium:platformName': 'iOS',
        'appium:platformVersion': '15.5',
        'appium:deviceName': 'iPhone 13',
        'appium:connectionRetryTimeout': 60000,
        'appium:noReset': true,
        'appium:app': __dirname + '/../../apps/ios-sim-debug.zip' // download local to run faster and save bandwith
        // app: 'https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/ios-sim-debug.zip',
      }
    : {};

const opts = {
  port: 4723,
  path: '/wd/hub',
  capabilities: {
    ...osSpecificOps,
    'appium:automationName': 'Flutter'
  }
};

(async () => {
  const counterTextFinder = find.byValueKey('counter');
  const buttonFinder = find.byValueKey('increment');

  const driver = await wdio.remote(opts);

  await validateElementPosition(driver, buttonFinder);

  assert.strictEqual(await driver.execute('flutter:checkHealth'), 'ok');
  await driver.execute('flutter:clearTimeline');
  await driver.execute('flutter:forceGC');

  const renderObjectDiagnostics = await driver.execute(
    'flutter:getRenderObjectDiagnostics',
    counterTextFinder,
    { includeProperties: true, subtreeDepth: 2 }
  );
  assert.strictEqual(renderObjectDiagnostics.type, 'DiagnosticableTreeNode');
  assert.strictEqual(renderObjectDiagnostics.children.length, 1);

  const semanticsId = await driver.execute(
    'flutter:getSemanticsId',
    counterTextFinder
  );
  assert.strictEqual(semanticsId, 4);

  const treeString = await driver.execute('flutter: getRenderTree');
  assert.strictEqual(treeString.substr(0, 11), 'RenderView#');

  await driver.switchContext('NATIVE_APP');
  await driver.saveScreenshot('./native-screenshot.png');
  await driver.switchContext('FLUTTER');
  await driver.saveScreenshot('./flutter-screenshot.png');

  /* new example
  if (process.env.APPIUM_OS === 'android') {
    await driver.switchContext('NATIVE_APP');
    await (await driver.$('~fab')).click();
    await driver.switchContext('FLUTTER');
  } else {
    console.log(
      'Switching context to `NATIVE_APP` is currently only applicable to Android demo app.'
    );
  }
  */

  assert.strictEqual(await driver.getElementText(counterTextFinder), '0');

  //Long Press using flutter command on Increment button, it should visible 'increment' tooltip after longTap
  await driver.execute('flutter:longTap', find.byValueKey('increment'), {durationMilliseconds: 10000, frequency: 30});

  //Long Press using TouchAction with wait
  await driver.touchAction([
    {
     action: 'longPress',
     element: { elementId: buttonFinder }
    },
    {
     action: 'wait',
     ms: 10000
    },
    {
     action: 'release'
    }
  ]);

  //Long Press using TouchAction without wait
  await driver.touchAction([
    {
     action: 'longPress',
     element: { elementId: buttonFinder }
    },
    {
     action: 'release'
    }
  ]);

  //Long Press using TouchAction without wait and release
  await driver.touchAction([
    {
     action: 'longPress',
     element: { elementId: buttonFinder }
    },
  ]);

  await driver.saveScreenshot('./flutter-longPress.png');

  await driver.elementClick(buttonFinder);
  await driver.touchAction({
    action: 'tap',
    element: { elementId: buttonFinder }
  });

  assert.strictEqual(await driver.getElementText(counterTextFinder), '2');

  await driver.elementClick(find.byTooltip('Increment'));

  assert.strictEqual(
    await driver.getElementText(
      find.descendant({
        of: find.byTooltip('counter_tooltip'),
        matching: find.byValueKey('counter')
      })
    ),
    '3'
  );

  await driver.elementClick(find.byType('FlatButton'));

  let firstWaitForAbsentError;
  try {
    await driver.execute('flutter:waitForAbsent', buttonFinder, {durationMilliseconds: 1});
  } catch(e) {
    firstWaitForAbsentError = e;
  } finally {
    // @todo
  }

  try {
    await driver.execute('flutter:waitForAbsent', buttonFinder, {durationMilliseconds: 'malformed input'});
  } catch(e) {
    firstWaitForAbsentError = e;
  } finally {
    // @todo
  }

  await driver.execute('flutter:waitForAbsent', buttonFinder);

  assert.strictEqual(
    await driver.getElementText(find.byText('This is 2nd route')),
    'This is 2nd route'
  );

  await driver.execute('flutter:scrollUntilVisible', find.byType('ListView'), {item:find.byType('TextField'), dxScroll: 90, dyScroll: -400});
  await driver.execute('flutter:scroll', find.byType('ListView'), {dx: 50, dy: 100, durationMilliseconds: 200, frequency: 30});
  await driver.execute('flutter:scrollIntoView', find.byType('TextField'), {alignment: 0.1});
  await driver.elementSendKeys(find.byType('TextField'), 'I can enter text');
  await driver.execute('flutter:waitFor', find.byText('I can enter text')); // verify text appears on UI
  await driver.elementClear(find.byType('TextField')); //It can Clear the text field

  await driver.elementClick(find.pageBack());
  await driver.execute(
    'flutter:waitFor',
    buttonFinder
  );

  assert.strictEqual(
    await driver.getElementText(
      find.descendant({
        of: find.ancestor({
          of: find.bySemanticsLabel(RegExp('counter_semantic')),
          matching: find.byType('Tooltip')
        }),
        matching: find.byType('Text')
      })
    ),
    '3'
  );

  driver.deleteSession();
})();

const validateElementPosition = async (driver, buttonFinder) => {
  const bottomLeft = await driver.execute(
    'flutter:getBottomLeft',
    buttonFinder
  );
  assert.strictEqual(typeof bottomLeft.dx, 'number');
  assert.strictEqual(typeof bottomLeft.dy, 'number');

  const bottomRight = await driver.execute(
    'flutter:getBottomRight',
    buttonFinder
  );
  assert.strictEqual(typeof bottomRight.dx, 'number');
  assert.strictEqual(typeof bottomRight.dy, 'number');

  const center = await driver.execute('flutter:getCenter', buttonFinder);
  assert.strictEqual(typeof center.dx, 'number');
  assert.strictEqual(typeof center.dy, 'number');

  const topLeft = await driver.execute('flutter:getTopLeft', buttonFinder);
  assert.strictEqual(typeof topLeft.dx, 'number');
  assert.strictEqual(typeof topLeft.dy, 'number');

  const topRight = await driver.execute('flutter:getTopRight', buttonFinder);
  assert.strictEqual(typeof topRight.dx, 'number');
  assert.strictEqual(typeof topRight.dy, 'number');
};
