@file:JvmName("_FinderRawMethods")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun byTooltip(input: String): FlutterElement {
  return FlutterElement(mapOf(
    "finderType" to "ByTooltipMessage",
    "text" to input
    ))
}
