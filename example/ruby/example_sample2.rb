require 'appium_lib_core'
require 'appium_flutter_finder'

require 'minitest/autorun'

class ExampleTests < Minitest::Test
  include ::Appium::Flutter::Finder

  CAPS = {
    caps: {
      platformName: 'Android',
      automationName: 'flutter',
      udid: 'emulator-5554',
      deviceName: 'Android',
      app: "#{Dir.pwd}/example/sample2/app-debug.apk",
      maxRetryCount: 60,
      retryBackoffTime: 10000,
    },
    appium_lib: {
      export_session: true,
      wait_timeout: 20,
      wait_interval: 1
    }
  }

  def setup
    @core = ::Appium::Core.for(CAPS)
    @driver = @core.start_driver server_url: 'http://localhost:4723'
  end

  def teardown
    @driver&.quit
  end

  def test_run_example_android
    @driver.context = 'NATIVE_APP'

    element = @driver.find_element :id, 'dev.flutter.example.androidfullscreen:id/launch_button'
    element.click

    @driver.orientation = :landscape
    assert_equal @driver.orientation, :landscape
    @driver.orientation = :portrait
    assert_equal @driver.orientation, :portrait


    @driver.context = 'FLUTTER'

    text_finder = by_text 'Tap me!'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    # @driver.execute_script('flutter:waitForTappable', text_finder, 1000)

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

    element = @driver.wait_until { |d| d.find_element :id, 'dev.flutter.example.androidfullscreen:id/counter_label' }
    assert_equal 'Current count: 2', element.text

    @driver.context = 'FLUTTER'
    @driver.terminate_app 'dev.flutter.example.androidfullscreen'
    @driver.activate_app 'dev.flutter.example.androidfullscreen'

    text_finder = by_text 'Tap me!'
    element = ::Appium::Flutter::Element.new(@driver, finder: text_finder)
    assert_equal 'Tap me!', element.text
  end
end
