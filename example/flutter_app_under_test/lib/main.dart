import 'package:flutter/material.dart';
import 'package:flutter_driver/driver_extension.dart';
import 'package:functional_widget_annotation/functional_widget_annotation.dart';
import 'package:hello_world/stream.dart';

part 'main.g.dart';

void main() {
  enableFlutterDriverExtension();
  init();
  runApp(MyApp());
}

@widget
Widget myApp() => MaterialApp(
  title: 'Counter App',
  home: MyHomePage(title: 'Counter App Home Page'),
);



@widget
Widget myHomePage(BuildContext context, {String title}) => Scaffold(
  appBar: AppBar(
    title: Text(title),
  ),
  body: Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Text(
          'You have pushed the button this many times:',
        ),
        Tooltip(
          message: 'counter_tooltip',
          child: StreamBuilder<int>(
            stream: counterStream,
            builder: (context, snapshot) {
              return Text(
                '${snapshot.data}',
                key: Key('counter'),
                style: Theme.of(context).textTheme.display1,
                semanticsLabel: 'counter_semantic',
              );
            }
          ),
        ),
        FlatButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => Scaffold(
                        appBar: AppBar(
                          title: Text("Second Route"),
                        ),
                        body: Center(
                          child: SecondPage(),
                        ),
                      )),
            );
          },
          child: Text(
            'Go to next route',
            key: Key('next_route_key'),
          ),
        ),
      ],
    ),
  ),
  floatingActionButton: FloatingActionButton(
    // Provide a Key to this button. This allows finding this
    // specific button inside the test suite, and tapping it.
    key: Key('increment'),
    onPressed: () => plusClickSink.add(null),
    tooltip: 'Increment',
    child: Icon(Icons.add),
  ),
);

@widget
Widget secondPage() => ListView(
  padding: const EdgeInsets.all(8.0),
  children: <Widget>[
    Container(
      height: 100,
      color: Colors.amber[600],
      child: const Center(child: Text('This is 2nd route')),
    ),
    Container(
      height: 200,
      color: Colors.amber[500],
      child: const Center(child: Text('Entry B')),
    ),
    Container(
      height: 500,
      color: Colors.amber[100],
      child: const Center(child: Text('Entry C')),
    ),
    Container(
      height: 1000,
      color: Colors.amber[100],
      child: const Center(child: Text('Entry D')),
    ),
    Container(
      height: 1000,
      color: Colors.amber[100],
      child: const Center(
          child: TextField(
        decoration: InputDecoration(
          border: OutlineInputBorder(),
          labelText: 'Sample Input',
        ),
      )),
    ),
  ],
);
