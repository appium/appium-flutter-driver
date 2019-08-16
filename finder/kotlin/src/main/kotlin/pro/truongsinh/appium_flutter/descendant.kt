package pro.truongsinh.appium_flutter

fun descendant(of: String, matching: String, matchRoot: Boolean = false): String {
  val m = mutableMapOf(
    "finderType" to "Descendant",
    "matchRoot" to matchRoot
  )
  deserialize(of).forEach {
    print(it.value)
    m.put("of_${it.key}", it.value!!)
  }
  deserialize(matching).forEach {
    m.put("matching_${it.key}", it.value!!)
  }
  return serialize(m)
}
