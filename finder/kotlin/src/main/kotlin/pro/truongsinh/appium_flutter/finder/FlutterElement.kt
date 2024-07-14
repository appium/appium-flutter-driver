package pro.truongsinh.appium_flutter.finder

import org.openqa.selenium.remote.RemoteWebElement

public class FlutterElement(m: Map<String, *>) : RemoteWebElement() {
  private var _rawMap: Map<String, *> = m

  init {
    id = serialize(m)
  }
  fun getRawMap():  Map<String, *> { return _rawMap }

  override fun toString(): String {
    return String.format("[FlutterElement]")
  }
}