require 'appium_lib_core'
require 'appium_flutter_finder'

require 'minitest/autorun'

class ExampleTests < Minitest::Test
  include ::Appium::Flutter::Finder

  CAPS = {
    caps: {
      platformName: 'iOS',
      automationName: 'flutter',
      platformVersion: '15.5',
      deviceName: 'iPhone 13',
      app: "#{Dir.pwd}/../sample2/iOSFullScreen.zip"
    },
    appium_lib: {
      export_session: true,
      wait_timeout: 20,
      wait_interval: 1
    }
  }.freeze

  def test_run_example_ios
    @core = ::Appium::Core.for(CAPS)
    @driver = @core.start_driver

    @driver.context = 'NATIVE_APP'

    element = @driver.find_element :accessibility_id, 'launchFlutter'
    element.click

    @driver.context = 'FLUTTER'

    text_finder = by_text 'Tap me!'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    assert_equal 'Tap me!', element.text

    element.click
    element.click

    text_finder = by_text 'Taps: 2'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    assert_equal 'Taps: 2', element.text

    text_finder = by_text 'Exit this screen'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    element.click

    @driver.context = 'NATIVE_APP'

    element = @driver.wait_until { |d| d.find_element :accessibility_id, 'currentCounter' }
    assert_equal 'Current counter: 2', element.text
  end
end
