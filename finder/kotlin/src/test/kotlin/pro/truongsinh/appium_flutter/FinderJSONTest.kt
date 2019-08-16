package pro.truongsinh.appium_flutter

import org.junit.Assert.assertEquals
import org.junit.Test

class FinderJSONTest {
    @Test fun TestAncestor() {
        assertEquals("42", ancestorJSON())
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
        assertEquals("42", pagebackJSON())
    }
    @Test fun testText() {
        assertEquals("42", textJSON())
    }
}
