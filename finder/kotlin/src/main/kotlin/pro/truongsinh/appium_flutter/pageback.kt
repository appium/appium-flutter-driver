package pro.truongsinh.appium_flutter

import java.util.Base64
import kotlinx.serialization.*
import kotlinx.serialization.json.*

val json = Json(JsonConfiguration.Stable)

fun pageback(): String {
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(hashMapOf("finderType" to "PageBack"))
  val base64Encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(jsonStringified.toByteArray())
  print(base64Encoded)
  return base64Encoded
}
