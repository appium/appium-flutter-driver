package pro.truongsinh.appium_flutter

import org.junit.Assert.assertEquals
import org.junit.Test

class FinderJSONTest {
    @Test fun TestAncestor() {
        val expected = "eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOmZhbHNlLCJvZl9maW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJvZl9tYXRjaFJvb3QiOmZhbHNlLCJvZl9vZl9maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJvZl9tYXRjaGluZ19maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJtYXRjaGluZ19maW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaGluZ19tYXRjaFJvb3QiOmZhbHNlLCJtYXRjaGluZ19vZl9maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJtYXRjaGluZ19tYXRjaGluZ19maW5kZXJUeXBlIjoiUGFnZUJhY2sifQ"
        val observed = ancestor(
            of = ancestor(
                of = pageback(),
                matching = pageback()
            ),
            matching = ancestor(
                of = pageback(),
                matching = pageback()
            )
        )
        assertEquals(expected, observed)
    }
    @Test fun TestBySemanticsLabelString() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ", bySemanticsLabel("simple"))
    }
    @Test fun TestBySemanticsLabelRegex() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0", bySemanticsLabel(Regex("complicated")))
    }
    @Test fun TestByTooltip() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ", byTooltip("myText"))
    }
    @Test fun TestByType() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9", byType("myText"))
    }
    @Test fun testByValueKeyString() {
        val expectedJsonElement = deserialize("eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ")
        val obserbedJsonElement = deserialize(byValueKey("42"))
        assertEquals(true, expectedJsonElement.equals(obserbedJsonElement))
    }
    @Test fun testByValueKeyInt() {
        val expectedJsonElement = deserialize("eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0")
        val obserbedJsonElement = deserialize(byValueKey(42))
        assertEquals(true, expectedJsonElement.equals(obserbedJsonElement))
    }
    @Test fun testDescendant() {
        assertEquals("42", descendantJSON())
    }
    @Test fun testPageback() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ", pageback())
    }
    @Test fun testText() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0", text("This is 2nd route"))
    }
}
