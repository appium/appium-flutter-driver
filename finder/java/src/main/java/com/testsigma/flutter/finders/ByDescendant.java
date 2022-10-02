package com.testsigma.flutter.finders;

import com.testsigma.flutter.FlutterElement;

/**
 * To identify the element using Descendant
 *
 * @author ashwith
 * @version 0.0.4
 */
public interface ByDescendant {

    FlutterElement byDescendant(FlutterElement of, FlutterElement matching, boolean matchRoot, boolean firstMatchOnly);

}