@file:JvmName("_FinderRawMethods")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun ancestor(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false, firstMatchOnly: Boolean = false): FlutterElement {
  val m = mutableMapOf(
    "finderType" to "Ancestor",
    "matchRoot" to matchRoot,
    "firstMatchOnly" to firstMatchOnly
  )
  m["of"] = of.getRawMap()
  m["matching"] = matching.getRawMap()
  return FlutterElement(m)
}
