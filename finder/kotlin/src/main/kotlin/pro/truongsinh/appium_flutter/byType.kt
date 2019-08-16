package pro.truongsinh.appium_flutter

fun byType(input: String): String {
  val base64Encoded = serialize(mapOf(
    "finderType" to "ByType",
    "type" to input
    ))
  return base64Encoded
}
