require 'appium_lib_core'
require 'appium_flutter_finder'

require 'minitest/autorun'

class ExampleTests < Minitest::Test
  include ::Appium::Flutter::Finder

  IOS_CAPS = {
    caps: {
      platformName: 'iOS',
      automationName: 'flutter',
      platformVersion: '15.5',
      deviceName: 'iPhone 13',
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

    text_finder = by_text 'You have pushed the button this many times:'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    assert_equal 'You have pushed the button this many times:', element.text

    @driver.execute_script 'flutter:getRenderTree'

    assert_equal 'ok', @driver.execute_script('flutter:checkHealth', {})

    key_finder = by_value_key 'next_route_key'
    goto_next_route_element = ::Appium::Flutter::Element.new(@driver, finder: key_finder)
    goto_next_route_element.click

    back_element = ::Appium::Flutter::Element.new(@driver, finder: page_back)
    back_element.click

    tooltip_finder = by_tooltip 'Increment'
    @driver.execute_script('flutter:waitFor', tooltip_finder, 100)
    floating_button_element = ::Appium::Flutter::Element.new(@driver, finder: tooltip_finder)
    floating_button_element.click

    counter_finder = by_value_key 'counter'
    counter_element = ::Appium::Flutter::Element.new(@driver, finder: counter_finder)
    assert_equal '1', counter_element.text
  end
end
