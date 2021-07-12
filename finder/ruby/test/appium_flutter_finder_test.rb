require 'test_helper'
require_relative '../lib/appium_flutter_finder'

class AppiumFlutterFinderTest < Minitest::Test
  include Appium::Flutter::Finder

  def test_by_ancestor
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOmZhbHNlLCJvZiI6IntcImZpbmRlclR5cGVcIjpcIkFuY2VzdG9yXCIsXCJtYXRjaFJvb3RcIjpmYWxzZSxcIm9mXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCIsXCJtYXRjaGluZ1wiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwifSIsIm1hdGNoaW5nIjoie1wiZmluZGVyVHlwZVwiOlwiQW5jZXN0b3JcIixcIm1hdGNoUm9vdFwiOmZhbHNlLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0=',
      by_ancestor(
        serialized_finder: by_ancestor(
          serialized_finder: page_back,
          matching: page_back
        ),
        matching: by_ancestor(
          serialized_finder: page_back,
          matching: page_back
        )
      )
    )
  end

  def test_by_descendant
    assert_equal(
      'eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsIm1hdGNoUm9vdCI6ZmFsc2UsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiRGVzY2VuZGFudFwiLFwibWF0Y2hSb290XCI6ZmFsc2UsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0iLCJtYXRjaGluZyI6IntcImZpbmRlclR5cGVcIjpcIkRlc2NlbmRhbnRcIixcIm1hdGNoUm9vdFwiOmZhbHNlLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0=',
      by_descendant(
        serialized_finder: by_descendant(
          serialized_finder: page_back,
          matching: page_back
        ),
        matching: by_descendant(
          serialized_finder: page_back,
          matching: page_back
        )
      )
    )
  end

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
