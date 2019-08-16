package pro.truongsinh.appium_flutter.finder

fun bySemanticsLabel(label: String): String {
  val base64Encoded = serialize(mapOf(
    "finderType" to "BySemanticsLabel",
    "isRegExp" to false,
    "label" to label
    ))
  return base64Encoded
}

fun bySemanticsLabel(label: Regex): String {
  val base64Encoded = serialize(mapOf(
    "finderType" to "BySemanticsLabel",
    "isRegExp" to true,
    "label" to label.toString()
    ))
  return base64Encoded
}
