package pro.truongsinh.appium_flutter

import org.junit.Assert.assertEquals
import org.junit.Test

class MyLibraryTest {
    @Test fun testMyLanguage() {
        assertEquals("42", byValueKey())
    }
}