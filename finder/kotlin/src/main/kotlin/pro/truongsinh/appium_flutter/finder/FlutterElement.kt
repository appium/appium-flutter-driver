package pro.truongsinh.appium_flutter.finder

import io.appium.java_client.MobileElement

public class FlutterElement : MobileElement {
  private var _rawMap: Map<String, *>
  constructor(m: Map<String, *>) {
    _rawMap = m
    id = serialize(m)
  }
  fun getRawMap():  Map<String, *> { return _rawMap }
}