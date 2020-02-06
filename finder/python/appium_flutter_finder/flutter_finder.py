from appium.webdriver import Remote
import base64
import json

from appium.webdriver.webelement import WebElement


class FlutterElement(WebElement):
    def __init__(self, driver, element_id):
        super(FlutterElement, self).__init__(
            driver, element_id, w3c=True
        )

    # text_finder = by_type('type')
    # element = FlutterElement(driver, text_finder)


class FlutterFinder(object):
    def by_tooltip(self, text):
        return self._serialize(dict(
            finderType='ByTooltipMessage',
            text=text
        ))

    def by_text(self, text):
        return self._serialize(dict(
            finderType='ByText',
            text=text
        ))

    def by_type(self, type_):
        return self._serialize(dict(
            finderType='ByType',
            type=type_
        ))

    def by_value_key(self, key):
        return self._serialize(dict(
            finderType='ByValueKey',
            keyValueString=key,
            keyValueType='String' if isinstance(key, str) else 'int'
        ))

    def page_back(self):
        return self._serialize(dict(
            finderType='PageBack'
        ))

    def _serialize(self, finder_dict):
        return base64.b64encode(json.dumps(finder_dict))


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
