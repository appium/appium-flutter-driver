package pro.truongsinh.appium_flutter

import java.util.regex.Pattern

import org.openqa.selenium.remote.RemoteWebDriver
import org.openqa.selenium.remote.FileDetector
import pro.truongsinh.appium_flutter.finder.FlutterElement
import pro.truongsinh.appium_flutter.finder.ancestor as _ancestor
import pro.truongsinh.appium_flutter.finder.bySemanticsLabel as _bySemanticsLabel
import pro.truongsinh.appium_flutter.finder.byTooltip as _byTooltip
import pro.truongsinh.appium_flutter.finder.byType as _byType
import pro.truongsinh.appium_flutter.finder.byValueKey as _byValueKey
import pro.truongsinh.appium_flutter.finder.descendant as _descendant
import pro.truongsinh.appium_flutter.finder.pageBack as _pageBack
import pro.truongsinh.appium_flutter.finder.text as _text


public class FlutterFinder(driver: RemoteWebDriver) {
  private val driver = driver
  private val fileDetector = FileDetector({ _ -> null })
  fun ancestor(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false, firstMatchOnly: Boolean = false): FlutterElement {
    val f = _ancestor(of, matching, matchRoot, firstMatchOnly)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun bySemanticsLabel(label: String): FlutterElement {
    val f = _bySemanticsLabel(label)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun bySemanticsLabel(label: Pattern): FlutterElement {
    val f = _bySemanticsLabel(label)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun byTooltip(input: String): FlutterElement {
    val f = _byTooltip(input)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun byType(input: String): FlutterElement {
    val f = _byType(input)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun byValueKey(input: String): FlutterElement {
    val f = _byValueKey(input)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun byValueKey(input: Int): FlutterElement {
    val f = _byValueKey(input)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun descendant(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false, firstMatchOnly: Boolean = false): FlutterElement {
    val f = _descendant(of, matching, matchRoot, firstMatchOnly)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun pageBack(): FlutterElement {
    val f = _pageBack()
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
  fun text(input: String): FlutterElement {
    val f = _text(input)
    f.setParent(driver)
    f.setFileDetector(fileDetector)
    return f
  }
}
