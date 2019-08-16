
package pro.truongsinh.appium_flutter.finder

import java.util.Base64

import kotlinx.serialization.*
import kotlinx.serialization.json.*

val json = Json(JsonConfiguration.Stable)
val base64encoder = Base64.getUrlEncoder().withoutPadding()
val base64decoder = Base64.getUrlDecoder()

fun serialize(o: Map<String, *>): String {
  val jsonObject = o.map { 
    val value = it.value
    val jsonO = when (value) {
      is String -> JsonLiteral(value)
      is Number -> JsonLiteral(value)
      is Boolean -> JsonLiteral(value)
      is JsonElement -> value
      else -> JsonNull
    }
    Pair(it.key, jsonO)
  }.toMap()
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(jsonObject)
  val base64Encoded = base64encoder.encodeToString(jsonStringified.toByteArray())
  return base64Encoded
}

fun deserialize(base64Encoded: String): Map<String, *> {
  val base64Decoded = String(base64decoder.decode(base64Encoded))
  val jsonObject = json.parseJson(base64Decoded) as JsonObject
  return jsonObject.toMap()
}
