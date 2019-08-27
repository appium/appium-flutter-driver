// Imports the Flutter Driver API.
import 'package:flutter_driver/flutter_driver.dart';
import 'package:test/test.dart';

void main() {
  group('Counter App', () {
    // First, define the Finders and use them to locate widgets from the
    // test suite. Note: the Strings provided to the `byValueKey` method must
    // be the same as the Strings we used for the Keys in step 1.
    final counterTextFinder = find.byValueKey('counter');
    final buttonFinder = find.byValueKey('increment');

    FlutterDriver driver;

    // Connect to the Flutter driver before running any tests.
    setUpAll(() async {
      driver = await FlutterDriver.connect(
        printCommunication: true,
      );
    });

    // Close the connection to the driver after the tests have completed.
    tearDownAll(() async {
      if (driver != null) {
        driver.close();
      }
    });

    test('starts at 0', () async {
      final h = await driver.checkHealth();
      expect(h.status, HealthStatus.ok);
      await driver.clearTimeline();
      final renderObject = await driver.getRenderObjectDiagnostics(counterTextFinder, subtreeDepth: 2, includeProperties: true);
      
      // Use the `driver.getText` method to verify the counter starts at 0.
      expect(await driver.getText(counterTextFinder), "0");
      await driver.getBottomLeft(counterTextFinder);
      await driver.getTopRight(counterTextFinder);
    });

    test('increments the counter', () async {
      // First, tap the button.
      await driver.tap(buttonFinder);
      await driver.tap(buttonFinder);

      // Then, verify the counter text is incremented by 1.
      expect(await driver.getText(counterTextFinder), "2");
    });

    test(' ', () async {
      await driver.tap(find.byTooltip('Increment'));
      expect(
          await driver.getText(find.descendant(
              of: find.byTooltip('counter_tooltip'),
              matching: find.byValueKey('counter'))),
          '3');

      await driver.tap(find.byType('FlatButton'));
      await driver.waitForAbsent(find.byTooltip('counter_tooltip'));
      expect(await driver.getText(find.text('This is 2nd route')),
          'This is 2nd route');
      await driver.scrollUntilVisible(find.byType('ListView'), find.byType('TextField'), dxScroll: 90, dyScroll: -400);
      await driver.scroll(find.byType('ListView'), 50, 100, Duration(milliseconds: 200), frequency: 30);
      await driver.scrollIntoView(find.byType('ListView'), alignment: 1.4);
      await driver.tap(find.byType('TextField'));
      await driver.enterText('I can enter text');
      await driver.waitFor(find.text('I can enter text'));  // verify text appears on UI

      await driver.tap(find.pageBack());
      await driver.waitFor(find.byTooltip('counter_tooltip'));
      expect(
          await driver.getText(
            find.descendant(
              of: find.ancestor(
                  of: find.bySemanticsLabel(RegExp('counter_semantic')),
                  matching: find.byType('Tooltip')),
              matching: find.byType('Text'),
            ),
          ),
          '3');
    });
  });
}
