import 'package:flutter/material.dart';
import 'package:flutter_driver/driver_extension.dart';

void main() {
  enableFlutterDriverExtension();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Counter App',
      home: MyHomePage(title: 'Counter App Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
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
              child: Text(
                '$_counter',
                key: Key('counter'),
                style: Theme.of(context).textTheme.display1,
                semanticsLabel: 'counter_semantic',
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
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ),
    );
  }
}

class SecondPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) => ListView(
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
}
