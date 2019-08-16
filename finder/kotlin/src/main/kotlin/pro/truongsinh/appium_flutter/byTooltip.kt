package pro.truongsinh.appium_flutter

fun byTooltip(input: String): String {
  val base64Encoded = serialize(hashMapOf(
    "finderType" to "ByTooltipMessage",
    "text" to input
    ))
  return base64Encoded
}
