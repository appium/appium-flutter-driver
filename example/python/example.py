import os

from appium.webdriver import Remote

# from appium.options.common.base import AppiumOptions
# AppiumOptions also can be used, but this may not have iOS specific commands.
from appium.options.ios.xcuitest.base import XCUITestOptions
from appium_flutter_finder.flutter_finder import FlutterElement, FlutterFinder

# Example

options = XCUITestOptions()
options.automation_name = 'flutter'
options.platform_name = 'ios'
options.set_capability('platformVersion', '17.0')
options.set_capability('deviceName', 'iPhone 15')
options.set_capability('app', f'{os.path.dirname(os.path.realpath(__file__))}/../sample2/IOSFullScreen.zip')

driver = Remote('http://localhost:4723', options=options)

driver.quit()

# below tests are different from the 'IOSFullScreen.zip'
finder = FlutterFinder()

text_finder = finder.by_text('You have pushed the button this many times:')
text_element = FlutterElement(driver, text_finder)
print(text_element.text)

key_finder = finder.by_value_key("next_route_key")
goto_next_route_element = FlutterElement(driver, key_finder)
print(goto_next_route_element.text)
goto_next_route_element.click()

back_finder = finder.page_back()
back_element = FlutterElement(driver, back_finder)
back_element.click()

tooltip_finder = finder.by_tooltip("Increment")
driver.execute_script('flutter:waitFor', tooltip_finder, 100)

floating_button_element = FlutterElement(driver, tooltip_finder)
floating_button_element.click()

counter_finder = finder.by_value_key("counter")
counter_element = FlutterElement(driver, counter_finder)
print(counter_element.text)
