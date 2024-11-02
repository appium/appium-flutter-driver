#### Flutter Driver Extension

Copy the [extended_commands.dart](extended_commands.dart) file to the `lib` folder of your Flutter project.

The entry point must include the `List<CommandExtension>?` commands argument in either `main.dart` or `test_main.dart` to properly handle the command extension.

```dart
import 'extended_commands.dart';


void main() {
  enableFlutterDriverExtension(
      commands: [DragCommandExtension()]);
  runApp(const MyApp());
}
```

#### Simple example using `dragAndDrop` command
```python
# python
coord_item_1 = driver.execute_script('flutter:getCenter', item_1)
coord_item_2 = driver.execute_script('flutter:getCenter', item_2)
start_x = coord_item_1['dx']
start_y = coord_item_1['dy']
end_y = coord_item_2['dy']

params = {
    "startX": start_x,
    "startY": start_y,
    "endX": "0",
    "endY": end_y,
    "duration": "15000" # minimum duration needed to perform the drag & drop is 15000ms
}

payload = {
    "command": "commandExtension",
    "dragAndDrop": params
}

driver.execute_script("flutter:commandExtension", payload)
```

#### Simple app with drag and drop functionality with the `extended_commands.dart` module

Follow the link: [command-driven-list](https://github.com/Alpaca00/command-driven-list)

---

**Note:** Not recommended to use this functionality in the production environment, due to the potential risk of app crashes and other issues.