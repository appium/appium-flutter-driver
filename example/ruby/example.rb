require 'appium_lib_core'
require 'appium_flutter_finder'

require 'minitest/autorun'

class ExampleTests < Minitest::Test
  include ::Appium::Flutter::Finder

  IOS_CAPS = {
    caps: {
      platformName: 'iOS',
      automationName: 'flutter',
      platformVersion: '12.4',
      deviceName: 'iPhone 8',
      app: "#{Dir.pwd}/../app/app/Runner.zip"
    },
    appium_lib: {
      export_session: true,
      wait_timeout: 20,
      wait_interval: 1
    }
  }.freeze

  def test_run_example_ios_scenario
    @core = ::Appium::Core.for(IOS_CAPS)
    @driver = @core.start_driver


    # [debug] [MJSONWP (044613d9)] Calling AppiumDriver.getText() with args: ["eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiY291bnRlciIsImtleVZhbHVlVHlwZSI6IlN0cmluZyJ9","044613d9-d722-4624-b32a-5c5369b2905d"]
    # [debug] [FlutterDriver] Executing Flutter driver command 'getText'
    # [debug] [FlutterDriver] >>> {"command":"get_text","finderType":"ByValueKey","keyValueString":"counter","keyValueType":"String"}
    # counter_text_finder  = by_value_key 'counter'
    # Appium::Flutter::Element.new(@driver, finder: counter_text_finder).text
    #
    # button_finder = by_value_key 'increment'
    # Appium::Flutter::Element.new(@driver, finder: button_finder).click


    # [HTTP] --> GET /wd/hub/session/c197c17b-640b-4945-b2ae-70dd951e1546/element/eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IllvdSBoYXZlIHB1c2hlZCB0aGUgYnV0dG9uIHRoaXMgbWFueSB0aW1lczoifQ==/text
    # [HTTP] {}
    # [debug] [MJSONWP (c197c17b)] Calling AppiumDriver.getText() with args: ["eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IllvdSBoYXZlIHB1c2hlZCB0aGUgYnV0dG9uIHRoaXMgbWFueSB0aW1lczoifQ==","c197c17b-640b-4945-b2ae-70dd951e1546"]
    # [debug] [FlutterDriver] Executing Flutter driver command 'getText'
    # [debug] [FlutterDriver] >>> {"command":"get_text","finderType":"ByText","text":"You have pushed the button this many times:"}
    # [debug] [FlutterDriver] <<< {"isError":false,"response":{"text":"You have pushed the button this many times:"},"type":"_extensionType","method":"ext.flutter.driver"} | previous command get_text
    # [debug] [MJSONWP (c197c17b)] Responding to client with driver.getText() result: "You have pushed the button this many times:"
    # [HTTP] <-- GET /wd/hub/session/c197c17b-640b-4945-b2ae-70dd951e1546/element/eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IllvdSBoYXZlIHB1c2hlZCB0aGUgYnV0dG9uIHRoaXMgbWFueSB0aW1lczoifQ==/text 200 23 ms - 117
    # [HTTP]
    text_finder = by_text 'You have pushed the button this many times:'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    assert_equal 'You have pushed the button this many times:', element.text

    @driver.execute_script 'flutter:getRenderTree'

    # [debug] [FlutterDriver] >>> {"command":"get_diagnostics_tree","finderType":"ByText","text":"You have pushed the button this many times:","diagnosticsType":"renderObject","includeProperties":true,"subtreeDepth":2}
    # @driver.execute_script 'flutter:getRenderObjectDiagnostics', text_finder, { includeProperties: true }

    assert_equal 'ok', @driver.execute_script('flutter:checkHealth', {})
  end
end
