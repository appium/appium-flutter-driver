package pro.truongsinh.appium_flutter

import kotlinx.serialization.*

fun text(input: String): String {
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(hashMapOf(
    "finderType" to "ByText",
    "text" to input
    ))
  val base64Encoded = serialize(jsonStringified)
  return base64Encoded
}
