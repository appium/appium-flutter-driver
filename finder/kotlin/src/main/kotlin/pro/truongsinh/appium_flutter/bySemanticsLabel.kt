package pro.truongsinh.appium_flutter

import kotlinx.serialization.*
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonLiteral

fun bySemanticsLabel(label: String): String {
  val asd = JsonObject(hashMapOf(
    "finderType" to JsonLiteral("BySemanticsLabel"),
    "isRegExp" to JsonLiteral(false),
    "label" to JsonLiteral(label)
    ))

  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(asd)
  val base64Encoded = serialize(jsonStringified)
  return base64Encoded
}

fun bySemanticsLabel(label: Regex): String {
  @UseExperimental(kotlinx.serialization.ImplicitReflectionSerializer::class)
  val jsonStringified = json.stringify(JsonObject(hashMapOf(
    "finderType" to JsonLiteral("BySemanticsLabel"),
    "isRegExp" to JsonLiteral(true),
    "label" to JsonLiteral(label.toString())
    )))
  val base64Encoded = serialize(jsonStringified)
  return base64Encoded
}
