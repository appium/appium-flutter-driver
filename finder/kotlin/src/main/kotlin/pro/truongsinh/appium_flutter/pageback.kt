package pro.truongsinh.appium_flutter

import kotlinx.serialization.*

fun pageback(): String {
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(hashMapOf("finderType" to "PageBack"))
  val base64Encoded = serialize(jsonStringified)
  return base64Encoded
}
