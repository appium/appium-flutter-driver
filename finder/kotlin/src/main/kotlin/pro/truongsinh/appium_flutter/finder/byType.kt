@file:JvmName("Finder")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun byType(input: String): String {
  val base64Encoded = serialize(mapOf(
    "finderType" to "ByType",
    "type" to input
    ))
  return base64Encoded
}
