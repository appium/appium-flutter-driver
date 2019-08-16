
package pro.truongsinh.appium_flutter

import java.util.Base64

import kotlinx.serialization.*
import kotlinx.serialization.json.*

val json = Json(JsonConfiguration.Stable)
val base64 = Base64.getUrlEncoder().withoutPadding()

fun serialize(o: Map<String,*>): String {
  val jsonObject = o.map { 
    val value = it.value
    val jsonO = when (value) {
      is String -> JsonLiteral(value)
      is Number -> JsonLiteral(value)
      is Boolean -> JsonLiteral(value)
      else -> JsonNull
    }
    Pair(it.key, jsonO)
  }.toMap()
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(jsonObject)
  val base64Encoded = base64.encodeToString(jsonStringified.toByteArray())
  return base64Encoded
}
