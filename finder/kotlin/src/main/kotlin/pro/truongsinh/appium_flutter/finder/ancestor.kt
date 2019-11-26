@file:JvmName("_FinderRawMethods")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun ancestor(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false): FlutterElement {
  val m = mutableMapOf(
    "finderType" to "Ancestor",
    "matchRoot" to matchRoot
  )
  of.getRawMap().forEach {
    m.put("of_${it.key}", it.value!!)
  }
  matching.getRawMap().forEach {
    m.put("matching_${it.key}", it.value!!)
  }
  return FlutterElement(m)
}
