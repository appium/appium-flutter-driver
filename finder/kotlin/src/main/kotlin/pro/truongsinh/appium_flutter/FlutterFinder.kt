package pro.truongsinh.appium_flutter

import io.appium.java_client.MobileElement
import org.openqa.selenium.remote.RemoteWebDriver
import pro.truongsinh.appium_flutter.finder.FlutterElement
import pro.truongsinh.appium_flutter.finder.ancestor as _ancestor
import pro.truongsinh.appium_flutter.finder.bySemanticsLabel as _bySemanticsLabel
import pro.truongsinh.appium_flutter.finder.byTooltip as _byTooltip
import pro.truongsinh.appium_flutter.finder.byType as _byType
import pro.truongsinh.appium_flutter.finder.byValueKey as _byValueKey
import pro.truongsinh.appium_flutter.finder.descendant as _descendant
import pro.truongsinh.appium_flutter.finder.pageback as _pageback
import pro.truongsinh.appium_flutter.finder.text as _text


public class FlutterFinder(driver: RemoteWebDriver) {
  private val driver = driver
  fun ancestor(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false): FlutterElement {
    val f = _ancestor(of, matching, matchRoot)
    f.setParent(driver)
    return f
  }
  fun bySemanticsLabel(label: String): FlutterElement {
    val f = _bySemanticsLabel(label)
    f.setParent(driver)
    return f
  }
  fun bySemanticsLabel(label: Regex): FlutterElement {
    val f = _bySemanticsLabel(label)
    f.setParent(driver)
    return f
  }
  fun byTooltip(input: String): FlutterElement {
    val f = _byTooltip(input)
    f.setParent(driver)
    return f
  }
  fun byType(input: String): FlutterElement {
    val f = _byType(input)
    f.setParent(driver)
    return f
  }
  fun byValueKey(input: String): FlutterElement {
    val f = _byValueKey(input)
    f.setParent(driver)
    return f
  }
  fun byValueKey(input: Int): FlutterElement {
    val f = _byValueKey(input)
    f.setParent(driver)
    return f
  }
  fun descendant(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false): FlutterElement {
    val f = _descendant(of, matching, matchRoot)
    f.setParent(driver)
    return f
  }
  fun pageback(): FlutterElement {
    val f = _pageback()
    f.setParent(driver)
    return f
  }
  fun text(input: String): FlutterElement {
    val f = _text(input)
    f.setParent(driver)
    return f
  }
}
