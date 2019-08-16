package pro.truongsinh.appium_flutter

fun text(input: String): String {
  val base64Encoded = serialize(hashMapOf(
    "finderType" to "ByText",
    "text" to input
    ))
  return base64Encoded
}
