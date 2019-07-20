package pro.truongsinh.appium_flutter.finder

import org.junit.Assert.assertEquals
import org.junit.Test

class FinderTest {
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
        ).id
        assertEquals(expected, observed)
    }
    @Test fun TestBySemanticsLabelString() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ", bySemanticsLabel("simple").id)
    }
    @Test fun TestBySemanticsLabelRegex() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0", bySemanticsLabel(Regex("complicated")).id)
    }
    @Test fun TestByTooltip() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ", byTooltip("myText").id)
    }
    @Test fun TestByType() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9", byType("myText").id)
    }
    @Test fun testByValueKeyString() {
        val expectedJsonElement = deserialize("eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ")
        val obserbedJsonElement = deserialize(byValueKey("42").id)
        assertEquals(true, expectedJsonElement.equals(obserbedJsonElement))
    }
    @Test fun testByValueKeyInt() {
        val expectedJsonElement = deserialize("eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0")
        val obserbedJsonElement = deserialize(byValueKey(42).id)
        assertEquals(true, expectedJsonElement.equals(obserbedJsonElement))
    }
    @Test fun testDescendant() {
        val expected = "eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsIm1hdGNoUm9vdCI6ZmFsc2UsIm9mX2ZpbmRlclR5cGUiOiJEZXNjZW5kYW50Iiwib2ZfbWF0Y2hSb290IjpmYWxzZSwib2Zfb2ZfZmluZGVyVHlwZSI6IlBhZ2VCYWNrIiwib2ZfbWF0Y2hpbmdfZmluZGVyVHlwZSI6IlBhZ2VCYWNrIiwibWF0Y2hpbmdfZmluZGVyVHlwZSI6IkRlc2NlbmRhbnQiLCJtYXRjaGluZ19tYXRjaFJvb3QiOmZhbHNlLCJtYXRjaGluZ19vZl9maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJtYXRjaGluZ19tYXRjaGluZ19maW5kZXJUeXBlIjoiUGFnZUJhY2sifQ"
        val observed = descendant(
            of = descendant(
                of = pageback(),
                matching = pageback()
            ),
            matching = descendant(
                of = pageback(),
                matching = pageback()
            )
        ).id
        assertEquals(expected, observed)
    }
    @Test fun testPageback() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ", pageback().id)
    }
    @Test fun testText() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0", text("This is 2nd route").id)
    }
}
