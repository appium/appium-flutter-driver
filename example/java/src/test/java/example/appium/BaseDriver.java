package example.appium;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import io.appium.java_client.service.local.AppiumServerHasNotBeenStartedLocallyException;
import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;

public class BaseDriver {
  public AppiumDriver<WebElement> driver;
  private static AppiumDriverLocalService service;

  @Before
  public void setUp() throws Exception {
    service = AppiumDriverLocalService.buildDefaultService();
    service.start();

    if (service == null || !service.isRunning()) {
      throw new AppiumServerHasNotBeenStartedLocallyException("An appium server node is not started!");
    }

    DesiredCapabilities capabilities = new DesiredCapabilities();
    capabilities.setCapability("platformVersion", "12.2");
    capabilities.setCapability("deviceName", "iPhone X");
    capabilities.setCapability("noReset", true);

    File classpathRoot = new File(System.getProperty("user.dir"));
    File appDir = new File(classpathRoot, "/../apps");
    File app = new File(appDir.getCanonicalPath(), "ios-sim-debug.zip");

    System.out.println(app.getAbsolutePath());
    capabilities.setCapability("app", app.getAbsolutePath());

    capabilities.setCapability("automationName", "Flutter");

    driver = new IOSDriver<>(service.getUrl(), capabilities);
  }

  @After
  public void tearDown() throws Exception {
    if (driver != null) {
      driver.quit();
    }
    if (service != null) {
      service.stop();
    }
  }
}
