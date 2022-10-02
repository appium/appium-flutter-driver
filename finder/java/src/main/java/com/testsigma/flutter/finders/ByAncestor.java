package com.testsigma.flutter.finders;

import com.testsigma.flutter.FlutterElement;

/**
 * To identify the element using Ancestor
 *
 * @author ashwith
 * @version 0.0.4
 */
public interface ByAncestor {

    FlutterElement byAncestor(FlutterElement of, FlutterElement matching, boolean matchRoot, boolean firstMatchOnly);
}
