package example.appium;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.assertEquals;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.io.File;

import org.openqa.selenium.OutputType;
import io.appium.java_client.MobileElement;
import pro.truongsinh.appium_flutter.FlutterFinder;
import pro.truongsinh.appium_flutter.finder.FlutterElement;

public class FlutterTest extends BaseDriver {
  protected FlutterFinder find;
  @Before
  public void setUp() throws Exception {
    super.setUp();
    find = new FlutterFinder(driver);
  }

  @Test
  public void basicTest () throws InterruptedException {
    String buttonFinderKey = "increment";
    FlutterElement counterTextFinder = find.byValueKey("counter");
    MobileElement buttonFinder = waitFor(buttonFinderKey);

    validateElementPosition(buttonFinder);

    assertEquals(driver.executeScript("flutter:checkHealth"), "ok");
    driver.executeScript("flutter:clearTimeline");
    driver.executeScript("flutter:forceGC");
    
    Map renderObjectDiagnostics = (Map) driver.executeScript(
      "flutter:getRenderObjectDiagnostics",
      counterTextFinder.getId(),
      new HashMap<String, Object>() {{
        put("includeProperties", true);
        put("subtreeDepth", 2);
      }}
    );

    assertEquals(renderObjectDiagnostics.get("type"), "DiagnosticableTreeNode");
    assertEquals(((List)renderObjectDiagnostics.get("children")).size(), 1);

    Object semanticsId = driver.executeScript(
      "flutter:getSemanticsId",
      counterTextFinder
    );
    assertEquals(semanticsId, 4L);

    String treeString = (String) driver.executeScript("flutter: getRenderTree");
    assertEquals(treeString.substring(0, 11), "RenderView#");


    driver.context("NATIVE_APP");
    File f1 = driver.getScreenshotAs(OutputType.FILE);
    f1.renameTo(new File("./native-screenshot.png"));
    driver.context("FLUTTER");
    File f2 = driver.getScreenshotAs(OutputType.FILE);
    f2.renameTo(new File("./flutter-screenshot.png"));

    assertEquals(counterTextFinder.getText(), "0");

    clickToElement(buttonFinderKey);
    // @todo tap not working?
    // buttonFinder.tap(1, 100);
    clickToElement(buttonFinderKey);
    assertEquals(counterTextFinder.getText(), "2");

    find.byTooltip("Increment").click();

    assertEquals(find.descendant(find.byTooltip("counter_tooltip"), find.byValueKey("counter"), false, false).getText(), "3");
    
    find.byType("FlatButton").click();
    driver.executeScript("flutter:waitForAbsent", buttonFinder);

    assertEquals(find.text("This is 2nd route").getText(), "This is 2nd route");

    driver.executeScript("flutter:scrollUntilVisible", find.byType("ListView"), new HashMap<String, Object>() {{
      put("item", find.byType("TextField"));
      put("dxScroll", 90);
      put("dyScroll", -400);
    }});

    driver.executeScript("flutter:scroll", find.byType("ListView"), new HashMap<String, Object>() {{
      put("item", find.byType("TextField"));
      put("dx", 50);
      put("dy", 100);
      put("durationMilliseconds", 200);
      put("frequency", 30);
    }});
    
    driver.executeScript("flutter:scrollIntoView", find.byType("ListView"), new HashMap<String, Object>() {{
      put("alignment", 0.1);
    }});

    find.byType("TextField").sendKeys("I can enter text"); // enter text
    driver.executeScript("flutter:waitFor", find.text("I can enter text")); // verify text appears on UI

    find.pageBack().click();
    driver.executeScript("flutter:waitFor", buttonFinder);

    find.descendant(
      find.ancestor(
        find.bySemanticsLabel(Pattern.compile("counter_semantic")),
        find.byType("Tooltip"), false, false
        ),
      find.byType("Text"), false, false
      )
      .click()
      ;
 
    driver.quit();
  }

  private void clickToElement(String locator){
    MobileElement el = waitFor(locator);
    el.click();
  }

  private MobileElement waitFor(String locator){
     return (MobileElement) driver.executeScript("flutter:waitFor", find.byValueKey(locator), 30);
  }

  private void validateElementPosition(MobileElement buttonFinder) {
    Map bottomLeft = (Map) driver.executeScript("flutter:getBottomLeft", buttonFinder);
    assertEquals(bottomLeft.get("dx") instanceof Long, true);
    assertEquals(bottomLeft.get("dy") instanceof Long, true);

    Map bottomRight = (Map) driver.executeScript("flutter:getBottomRight", buttonFinder);
    assertEquals(bottomRight.get("dx") instanceof Long, true);
    assertEquals(bottomRight.get("dy") instanceof Long, true);

    Map center = (Map) driver.executeScript("flutter:getCenter", buttonFinder);
    assertEquals(center.get("dx") instanceof Long, true);
    assertEquals(center.get("dy") instanceof Long, true);

    Map topLeft = (Map) driver.executeScript("flutter:getTopLeft", buttonFinder);
    assertEquals(topLeft.get("dx") instanceof Long, true);
    assertEquals(topLeft.get("dy") instanceof Long, true);

    Map topRight = (Map) driver.executeScript("flutter:getTopRight", buttonFinder);
    assertEquals(topRight.get("dx") instanceof Long, true);
    assertEquals(topRight.get("dy") instanceof Long, true);
  }
}
