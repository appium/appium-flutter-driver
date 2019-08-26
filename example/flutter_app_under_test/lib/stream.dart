import 'dart:async' show StreamSink;

import 'package:rxdart/rxdart.dart'
    show BehaviorSubject;

final counterSubject = new BehaviorSubject<int>.seeded(0);
final counterStream = counterSubject.stream;

final plusClickSubject = new BehaviorSubject<void>();
final StreamSink plusClickSink = plusClickSubject;

void init() {
  plusClickSubject.stream.withLatestFrom<int, int>(
    counterSubject,
    (_, a) => a + 1,
  ).pipe(counterSubject);
}
