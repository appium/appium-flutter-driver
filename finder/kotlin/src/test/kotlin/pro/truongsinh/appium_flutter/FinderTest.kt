package pro.truongsinh.appium_flutter

import org.junit.Assert.assertEquals
import org.junit.Test

class FinderTest {
    @Test fun testByValueKey() {
        assertEquals("42", byValueKey())
    }
    @Test fun TestAncestor() {
        assertEquals("42", ancestor())
    }
}
