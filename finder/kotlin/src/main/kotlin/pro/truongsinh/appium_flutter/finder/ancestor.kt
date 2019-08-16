@file:JvmName("Finder")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun ancestor(of: String, matching: String, matchRoot: Boolean = false): String {
  val m = mutableMapOf(
    "finderType" to "Ancestor",
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
