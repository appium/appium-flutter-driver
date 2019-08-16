package example.appium;

import org.junit.Test;
import pro.truongsinh.appium_flutter.finder.Finder;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.Assert.assertEquals;

public class FlutterTest extends BaseDriver{
    @Test
    public void simpleTest(){
      String a = Finder.text("input");
      System.out.println(a);
    }

}
