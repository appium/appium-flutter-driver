require 'test_helper'
require_relative '../lib/appium_flutter_finder'

class AppiumFlutterFinderTest < Minitest::Test
  include AppiumFlutterFinder

  def test_by_semantics_label
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ==',
      by_semantics_label('simple')
    )
  end

  def test_by_semantics_label_regex
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0=',
      by_semantics_label(/complicated/)
    )
  end

  def test_by_tooltip
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ==',
      by_tooltip('myText')
    )
  end

  def test_by_type
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9',
      by_type('myText')
    )
  end

  def test_by_key_value_int
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0=',
      by_value_key(42)
    )
  end

  def test_by_key_value_string
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ==',
      by_value_key('42')
    )
  end

  def test_page_back
    assert_equal 'eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ==', page_back
  end


  def test_by_text
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0=',
      by_text('This is 2nd route')
    )
  end
end
