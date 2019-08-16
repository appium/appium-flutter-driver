
package pro.truongsinh.appium_flutter

import java.util.Base64

import kotlinx.serialization.*
import kotlinx.serialization.json.*

val json = Json(JsonConfiguration.Stable)
val base64 = Base64.getUrlEncoder().withoutPadding()

fun serialize(o: Map<String,*>): String {
  val jsonObject = o.map { 
    if(it.value is String) {
      Pair(it.key, JsonLiteral(it.value as String))
    } else if (it.value is Boolean) {
      Pair(it.key, JsonLiteral(it.value as Boolean))
    } else if (it.value is Int) {
      Pair(it.key, JsonLiteral(it.value as Int))
    } else {
      Pair(it.key, JsonNull)
    }
  }.toMap()
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(jsonObject)
  val base64Encoded = base64.encodeToString(jsonStringified.toByteArray())
  return base64Encoded
}
