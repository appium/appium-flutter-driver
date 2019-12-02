@file:JvmName("_FinderRawMethods")
@file:JvmMultifileClass
package pro.truongsinh.appium_flutter.finder

fun text(input: String): FlutterElement {
  return FlutterElement(mapOf(
    "finderType" to "ByText",
    "text" to input
    ))
}
