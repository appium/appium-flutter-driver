package example.appium;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.assertEquals;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.File;

import org.openqa.selenium.OutputType;
import io.appium.java_client.MobileElement;

import pro.truongsinh.appium_flutter.FlutterFinder;

public class FlutterTest extends BaseDriver {
  protected FlutterFinder find;
  @Before
  public void setUp() throws Exception {
    super.setUp();
    find = new FlutterFinder(driver);
  }
  @Test
  public void basicTest () throws InterruptedException {
    MobileElement counterTextFinder = find.byValueKey("counter");
    MobileElement buttonFinder = find.byValueKey("increment");
    // await validateElementPosition(driver, buttonFinder);

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
    assertEquals(semanticsId, new Long(4));

    String treeString = (String) driver.executeScript("flutter: getRenderTree");
    assertEquals(treeString.substring(0, 11), "RenderView#");


    driver.context("NATIVE_APP");
    File f1 = driver.getScreenshotAs(OutputType.FILE);
    f1.renameTo(new File("./native-screenshot.png"));
    driver.context("FLUTTER");
    File f2 = driver.getScreenshotAs(OutputType.FILE);
    f2.renameTo(new File("./flutter-screenshot.png"));
  }

}
