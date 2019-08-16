package pro.truongsinh.appium_flutter

import org.junit.Assert.assertEquals
import org.junit.Test

class FinderJSONTest {
    @Test fun TestAncestor() {
        // val expected = "eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOmZhbHNlLCJvZl9maW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsIm9mX2lzUmVnRXhwIjp0cnVlLCJvZl9sYWJlbCI6ImNvdW50ZXJfc2VtYW50aWMiLCJtYXRjaGluZ19maW5kZXJUeXBlIjoiQnlUeXBlIiwibWF0Y2hpbmdfdHlwZSI6IlRvb2x0aXAifQ"
        // assertEquals(expected, ancestor())
    }
    @Test fun TestBySemanticsLabel() {
        assertEquals("42", bySemanticsLabelJSON())
    }
    @Test fun TestByTooltip() {
        assertEquals("42", byTooltipJSON())
    }
    @Test fun TestByType() {
        assertEquals("42", byTypeJSON())
    }
    @Test fun testByValueKey() {
        assertEquals("42", byValueKeyJSON())
    }
    @Test fun testDescendant() {
        assertEquals("42", descendantJSON())
    }
    @Test fun testPageback() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ", pageback())
    }
    @Test fun testText() {
        assertEquals("42", textJSON())
    }
}
