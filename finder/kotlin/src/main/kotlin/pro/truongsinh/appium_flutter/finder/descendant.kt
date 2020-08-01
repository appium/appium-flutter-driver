@file:JvmName("_FinderRawMethods")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun descendant(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false, firstMatchOnly: Boolean = false): FlutterElement {
  val m = mutableMapOf(
    "finderType" to "Descendant",
    "matchRoot" to matchRoot,
    "firstMatchOnly" to firstMatchOnly
  )
  of.getRawMap().forEach {
    m.put("of_${it.key}", it.value!!)
  }
  matching.getRawMap().forEach {
    m.put("matching_${it.key}", it.value!!)
  }
  return FlutterElement(m)
}
