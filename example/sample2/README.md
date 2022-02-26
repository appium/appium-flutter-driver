Sample app in https://github.com/flutter/samples/tree/master/add_to_app/fullscreen


## Diff

The sample app has `enableFlutterDriverExtension` in the main.dart for testing purpose.

```diff
--- a/add_to_app/fullscreen/flutter_module/lib/main.dart
+++ b/add_to_app/fullscreen/flutter_module/lib/main.dart
@@ -6,8 +6,14 @@ import 'package:flutter/material.dart';
 import 'package:flutter/services.dart';
 import 'package:provider/provider.dart';

+import 'package:flutter_driver/driver_extension.dart';
+
 /// The entrypoint for the flutter module.
 void main() {
+
+  // for testing example
+  enableFlutterDriverExtension();
+
   // This call ensures the Flutter binding has been set up before creating the
   // MethodChannel-based model.
```

## iOS app changes

Add accessibility labels for 
`Current counter` -> `currentCounter`
 `Launch FLutter ViewController` -> `launchFlutter`