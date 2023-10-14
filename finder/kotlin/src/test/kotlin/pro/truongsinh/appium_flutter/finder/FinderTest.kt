package pro.truongsinh.appium_flutter.finder

import java.util.regex.Pattern;

import org.junit.Assert.assertEquals
import org.junit.Test

class FinderTest {
    @Test fun TestAncestor() {
        val expected = "eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOiJmYWxzZSIsImZpcnN0TWF0Y2hPbmx5IjoiZmFsc2UiLCJvZiI6IntcImZpbmRlclR5cGVcIjpcIkFuY2VzdG9yXCIsXCJtYXRjaFJvb3RcIjpcImZhbHNlXCIsXCJmaXJzdE1hdGNoT25seVwiOlwiZmFsc2VcIixcIm9mXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCIsXCJtYXRjaGluZ1wiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwifSIsIm1hdGNoaW5nIjoie1wiZmluZGVyVHlwZVwiOlwiQW5jZXN0b3JcIixcIm1hdGNoUm9vdFwiOlwiZmFsc2VcIixcImZpcnN0TWF0Y2hPbmx5XCI6XCJmYWxzZVwiLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0"
        val observed = ancestor(
            of = ancestor(
                of = pageBack(),
                matching = pageBack()
            ),
            matching = ancestor(
                of = pageBack(),
                matching = pageBack()
            )
        ).id
        assertEquals(expected, observed)
    }
    @Test fun TestBySemanticsLabelString() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ", bySemanticsLabel("simple").id)
    }
    @Test fun TestBySemanticsLabelRegex() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0", bySemanticsLabel(Pattern.compile("complicated")).id)
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
        val expected = "eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsIm1hdGNoUm9vdCI6ImZhbHNlIiwiZmlyc3RNYXRjaE9ubHkiOiJmYWxzZSIsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiRGVzY2VuZGFudFwiLFwibWF0Y2hSb290XCI6XCJmYWxzZVwiLFwiZmlyc3RNYXRjaE9ubHlcIjpcImZhbHNlXCIsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0iLCJtYXRjaGluZyI6IntcImZpbmRlclR5cGVcIjpcIkRlc2NlbmRhbnRcIixcIm1hdGNoUm9vdFwiOlwiZmFsc2VcIixcImZpcnN0TWF0Y2hPbmx5XCI6XCJmYWxzZVwiLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0"
        val observed = descendant(
            of = descendant(
                of = pageBack(),
                matching = pageBack()
            ),
            matching = descendant(
                of = pageBack(),
                matching = pageBack()
            )
        ).id
        assertEquals(expected, observed)
    }
    @Test fun testPageback() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ", pageBack().id)
    }
    @Test fun testText() {
        assertEquals("eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0", text("This is 2nd route").id)
    }
}
