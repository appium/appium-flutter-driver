package com.testsigma.flutter.finders;

import com.testsigma.flutter.FlutterElement;

import java.util.regex.Pattern;

/**
 * To identify the element using SemanticsLabel
 * @author ashwith
 * @version 0.0.4
 */
public interface BySemanticsLabel {

    FlutterElement bySemanticsLabel(String label);

    FlutterElement bySemanticsLabel(Pattern label);
}
