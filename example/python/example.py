from appium.webdriver import Remote
from appium_flutter_finder import FlutterElement, FlutterFinder

# Example

driver = Remote('http://localhost:4723/wd/hub', dict(
    platformName='iOS',
    automationName='flutter',
    platformVersion='12.4',
    deviceName='iPhone 8',
    app='/Users/kazu/GitHub/flutter_app/build/ios/Debug-iphonesimulator/Runner.app'
))

finder = FlutterFinder()
text_finder = finder.by_text('You have pushed the button this many times:')
element = FlutterElement(driver, text_finder)
print(element.text)
