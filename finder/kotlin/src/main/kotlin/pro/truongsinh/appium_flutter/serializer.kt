
package pro.truongsinh.appium_flutter

import java.util.Base64

import kotlinx.serialization.*
import kotlinx.serialization.json.*

val json = Json(JsonConfiguration.Stable)
val base64 = Base64.getUrlEncoder().withoutPadding()

fun serialize(jsonStringified: String): String {
  val base64Encoded = base64.encodeToString(jsonStringified.toByteArray())
  return base64Encoded
}
