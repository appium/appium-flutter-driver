package example.appium;

import org.junit.Before;
import org.junit.Test;
import pro.truongsinh.appium_flutter.FlutterFinder;

import static org.junit.Assert.assertEquals;

import io.appium.java_client.MobileElement;

public class FlutterTest extends BaseDriver {
  protected FlutterFinder finder;
  @Before
  public void setUp() throws Exception {
    super.setUp();
    finder = new FlutterFinder(driver);
  }
  @Test
  public void basicTest () throws InterruptedException {
    MobileElement el1 = finder.byValueKey("increment");
    el1.click();
    Thread.sleep(1000);
  }

}
