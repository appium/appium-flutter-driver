package pro.truongsinh.appium_flutter.finder

fun byValueKey(input: String): String {
  val base64Encoded = serialize(mapOf(
    "finderType" to "ByValueKey",
    "keyValueType" to "String",
    "keyValueString" to input
    ))
  return base64Encoded
}

fun byValueKey(input: Int): String {
  val base64Encoded = serialize(mapOf(
    "finderType" to "ByValueKey",
    "keyValueType" to "int",
    "keyValueString" to input
    ))
  return base64Encoded
}
