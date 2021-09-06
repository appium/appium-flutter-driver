import unittest

import appium_flutter_finder.flutter_finder as finder


class FlutterFinderTest(unittest.TestCase):
    def test_by_ancestor(self):
        assert finder.FlutterFinder().by_ancestor(
            finder.FlutterFinder().by_ancestor(
                finder.FlutterFinder().page_back(),
                finder.FlutterFinder().page_back()
            ),
            finder.FlutterFinder().by_ancestor(
                finder.FlutterFinder().page_back(),
                finder.FlutterFinder().page_back()
            )
        ) == (
            'eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOmZhbHNlLCJvZiI6IntcImZp' \
            'bmRlclR5cGVcIjpcIkFuY2VzdG9yXCIsXCJtYXRjaFJvb3RcIjpmYWxzZSxcIm9mXCI6XCJ7' \
            'XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCIsXCJtYXRjaGluZ1wiOlwi' \
            'e1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwifSIsIm1hdGNoaW5nIjoi' \
            'e1wiZmluZGVyVHlwZVwiOlwiQW5jZXN0b3JcIixcIm1hdGNoUm9vdFwiOmZhbHNlLFwib2Zc' \
            'IjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5n' \
            'XCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0='
        )

    def test_by_descendant(self):
        assert finder.FlutterFinder().by_descendant(
            finder.FlutterFinder().by_descendant(
                finder.FlutterFinder().page_back(),
                finder.FlutterFinder().page_back()
            ),
            finder.FlutterFinder().by_descendant(
                finder.FlutterFinder().page_back(),
                finder.FlutterFinder().page_back()
            )
        ) == (
            'eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsIm1hdGNoUm9vdCI6ZmFsc2UsIm9mIjoie1wi' \
            'ZmluZGVyVHlwZVwiOlwiRGVzY2VuZGFudFwiLFwibWF0Y2hSb290XCI6ZmFsc2UsXCJvZlwi' \
            'Olwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdc' \
            'IjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0iLCJtYXRjaGlu' \
            'ZyI6IntcImZpbmRlclR5cGVcIjpcIkRlc2NlbmRhbnRcIixcIm1hdGNoUm9vdFwiOmZhbHNl' \
            'LFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1h' \
            'dGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0='
        )

    def test_by_semantics_label(self):
        assert finder.FlutterFinder().by_semantics_label('simple') == \
            'eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ=='

    def test_by_semantics_label_regex(self):
        assert finder.FlutterFinder().by_semantics_label(r'complicated', isRegExp=True) == \
            'eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0='

    def test_by_tooltip(self):
        assert finder.FlutterFinder().by_tooltip('myText') == \
            'eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ=='

    def test_by_type(self):
        assert finder.FlutterFinder().by_type('myText') == \
            'eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9'

    def test_by_key_value_int(self):
        assert finder.FlutterFinder().by_value_key(42) == \
            'eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0='

    def test_by_key_value_string(self):
        assert finder.FlutterFinder().by_value_key('42') == \
            'eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ=='

    def test_page_back(self):
        assert finder.FlutterFinder().page_back() == \
            'eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ=='

    def test_by_text(self):
        assert finder.FlutterFinder().by_text('This is 2nd route') == \
            'eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0='
