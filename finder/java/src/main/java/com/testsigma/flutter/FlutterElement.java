package com.testsigma.flutter;


import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import org.openqa.selenium.remote.RemoteWebElement;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Implement FlutterElement extending RemoteWebElement to enable common Mobile element operations such as click, enter e.t.c on FlutterElement objects
 *
 * @author renju
 * @version 0.0.4
 */
public class FlutterElement extends RemoteWebElement {

    private final Map<String, Object> rawMap;
    private final Gson gson = new Gson();

    public FlutterElement(final Map<String, Object> rawMap) {
        this.rawMap = rawMap;
        id = serialize(rawMap);
    }

    /**
     * To return the raw data map
     *
     * @return raw data map
     */
    public Map<String, Object> getRawMap() {
        return rawMap;
    }

    /**
     * To serialize raw data map
     *
     * @param rawMap serializing map
     * @return Stringify map
     */
    public String serialize(final Map<String, Object> rawMap) {
        final JsonPrimitive localInstance = new JsonPrimitive(false);
        Map<String, Object> tempMap = new HashMap<>();
        rawMap.forEach(
                (key, value) -> {
                    if (value instanceof String || value instanceof Integer || value instanceof Boolean) {
                        tempMap.put(key, new JsonPrimitive(String.valueOf(value)));
                    } else if (value instanceof JsonElement) {
                        tempMap.put(key, value);
                    } else {
                        tempMap.put(key, localInstance);
                    }
                });
        String mapJsonStringify = gson.toJson(tempMap);
        return Base64.getEncoder().encodeToString(mapJsonStringify.getBytes());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        FlutterElement that = (FlutterElement) o;
        return Objects.equals(rawMap, that.rawMap) && Objects.equals(gson, that.gson);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), rawMap, gson);
    }
}
