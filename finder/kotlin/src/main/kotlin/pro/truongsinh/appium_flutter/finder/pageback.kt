@file:JvmName("Finder")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun pageback(): String {
  val base64Encoded = serialize(mapOf("finderType" to "PageBack"))
  return base64Encoded
}
