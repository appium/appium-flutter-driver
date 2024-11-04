import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_driver/driver_extension.dart';
import 'package:flutter_driver/src/common/message.dart';
import 'package:flutter_driver/src/extension/extension.dart';
import 'package:flutter_test/flutter_test.dart';


class DragCommand extends Command {
  final double startX;
  final double startY;
  final double endX;
  final double endY;
  final Duration duration;

  DragCommand(this.startX, this.startY, this.endX, this.endY, this.duration);

  @override
  String get kind => 'dragAndDropWithCommandExtension';

  DragCommand.deserialize(Map<String, String> params)
      : startX = double.parse(params['startX']!),
        startY = double.parse(params['startY']!),
        endX = double.parse(params['endX']!),
        endY = double.parse(params['endY']!),
        duration = Duration(milliseconds: int.parse(params['duration']!));
}


class DragResult extends Result {
  final bool success;

  const DragResult(this.success);

  @override
  Map<String, dynamic> toJson() {
    return {
      'success': success,
    };
  }
}


class DragCommandExtension extends CommandExtension {
  @override
  Future<Result> call(Command command, WidgetController prober,
      CreateFinderFactory finderFactory, CommandHandlerFactory handlerFactory) async {
    final DragCommand dragCommand = command as DragCommand;

    final Offset startLocation = Offset(dragCommand.startX, dragCommand.startY);
    final Offset offset = Offset(dragCommand.endX - dragCommand.startX, dragCommand.endY - dragCommand.startY);

    await prober.timedDragFrom(startLocation, offset, dragCommand.duration);

    return const DragResult(true);
  }

  @override
  String get commandKind => 'dragAndDropWithCommandExtension';

  @override
  Command deserialize(
      Map<String, String> params,
      DeserializeFinderFactory finderFactory,
      DeserializeCommandFactory commandFactory) {
    return DragCommand.deserialize(params);
  }
}
