@file:JvmName("_FinderRawMethods")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun ancestor(of: FlutterElement, matching: FlutterElement, matchRoot: Boolean = false, firstMatchOnly: Boolean = false): FlutterElement {
  val m = mutableMapOf<String, Any>(
    "finderType" to "Ancestor",
    "matchRoot" to matchRoot.toString(),
    "firstMatchOnly" to firstMatchOnly.toString()
  )
  m["of"] = of.getRawMap()
  m["matching"] = matching.getRawMap()
  return FlutterElement(m)
}
