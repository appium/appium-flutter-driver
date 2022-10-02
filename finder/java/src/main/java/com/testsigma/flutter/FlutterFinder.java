package com.testsigma.flutter;


import com.testsigma.flutter.finders.*;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Flutter finder implementation of different type of flutter element finder
 *
 * @author renju
 * @version 0.0.4
 */
public class FlutterFinder implements ByValueKey, ByType, ByToolTip, ByText, ByAncestor, ByDescendant, BySemanticsLabel, PageBack {
    RemoteWebDriver driver;
    FileDetector fileDetector;
    private static final String FINDER_TYPE = "finderType";

    public FlutterFinder(RemoteWebDriver driver) {
        this.driver = driver;
        this.fileDetector = null;
    }

    @Override
    public FlutterElement byValueKey(String key) {
        FlutterElement flutterElement = new FlutterElement(Map
                .of(FINDER_TYPE, "ByValueKey",
                        "keyValueType", "String",
                        "keyValueString", key));
        flutterElement.setParent(driver);
        flutterElement.setFileDetector(fileDetector);
        return flutterElement;
    }

    @Override
    public FlutterElement byValueKey(int key) {
        FlutterElement flutterElement = new FlutterElement(Map
                .of(FINDER_TYPE, "ByValueKey",
                        "keyValueType", "int",
                        "keyValueString", key));
        flutterElement.setParent(driver);
        flutterElement.setFileDetector(fileDetector);
        return flutterElement;
    }

    @Override
    public FlutterElement byType(String type) {
        return new FlutterElement(Map.of(
                FINDER_TYPE, "ByType",
                "type", type
        ));
    }

    @Override
    public FlutterElement byToolTip(String toolTipText) {
        return new FlutterElement(Map.of(
                FINDER_TYPE, "ByTooltipMessage",
                "text", toolTipText
        ));
    }

    @Override
    public FlutterElement byText(String input) {
        return new FlutterElement(Map.of(
                FINDER_TYPE, "ByText",
                "text", input
        ));
    }

    @Override
    public FlutterElement byAncestor(FlutterElement of, FlutterElement matching, boolean matchRoot, boolean firstMatchOnly) {
        Map<String, Object> matchIdentifier = new HashMap<>(Map.of(
                FINDER_TYPE, "Ancestor",
                "matchRoot", matchRoot,
                "firstMatchOnly", firstMatchOnly
        ));
        matchIdentifier.put("of", of.getRawMap());
        matchIdentifier.put("matching", matching.getRawMap());
        return new FlutterElement(matchIdentifier);
    }

    @Override
    public FlutterElement byDescendant(FlutterElement of, FlutterElement matching, boolean matchRoot, boolean firstMatchOnly) {
        Map<String, Object> matchIdentifier = new HashMap<>(Map.of(
                FINDER_TYPE, "Descendant",
                "matchRoot", matchRoot,
                "firstMatchOnly", firstMatchOnly
        ));
        matchIdentifier.put("of", of.getRawMap());
        matchIdentifier.put("matching", matching.getRawMap());
        return new FlutterElement(matchIdentifier);
    }

    @Override
    public FlutterElement bySemanticsLabel(String label) {
        return new FlutterElement(Map.of(
                FINDER_TYPE, "BySemanticsLabel",
                "isRegExp", false,
                "label", label
        ));
    }

    @Override
    public FlutterElement bySemanticsLabel(Pattern label) {
        return new FlutterElement(Map.of(
                FINDER_TYPE, "BySemanticsLabel",
                "isRegExp", true,
                "label", label.toString()
        ));
    }

    @Override
    public FlutterElement pageBack() {
        return new FlutterElement(Map.of(FINDER_TYPE, "PageBack"));
    }
}