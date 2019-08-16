package pro.truongsinh.appium_flutter

fun pageback(): String {
  val base64Encoded = serialize(hashMapOf("finderType" to "PageBack"))
  return base64Encoded
}
