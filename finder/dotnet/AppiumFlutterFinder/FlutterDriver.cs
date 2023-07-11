using AppiumFlutterFinder;
using OpenQA.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.MultiTouch;
using OpenQA.Selenium.Appium.Service;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AppiumFlutterFinder
{
    public class FlutterDriver : AppiumDriver<FlutterElement>
    {
        #region Overrides
        public FlutterDriver(ICapabilities appiumOptions) : base(appiumOptions)
        {
        }

        public FlutterDriver(ICommandExecutor commandExecutor, ICapabilities appiumOptions) : base(commandExecutor, appiumOptions)
        {
        }

        public FlutterDriver(ICapabilities appiumOptions, TimeSpan commandTimeout) : base(appiumOptions, commandTimeout)
        {
        }



        public FlutterDriver(AppiumServiceBuilder builder, ICapabilities appiumOptions) : base(builder, appiumOptions)
        {
        }

        public FlutterDriver(Uri remoteAddress, ICapabilities appiumOptions) : base(remoteAddress, appiumOptions)
        {
        }

        public FlutterDriver(AppiumLocalService service, ICapabilities appiumOptions) : base(service, appiumOptions)
        {
        }


        public FlutterDriver(AppiumServiceBuilder builder, ICapabilities appiumOptions, TimeSpan commandTimeout) : base(builder, appiumOptions, commandTimeout)
        {
        }

        public FlutterDriver(Uri remoteAddress, ICapabilities appiumOptions, TimeSpan commandTimeout) : base(remoteAddress, appiumOptions, commandTimeout)
        {
        }

        protected override RemoteWebElementFactory CreateElementFactory() => new FlutterElementFactory(this);
        public FlutterDriver(AppiumLocalService service, ICapabilities appiumOptions, TimeSpan commandTimeout) : base(service, appiumOptions, commandTimeout)
        {

        }
        #endregion


        public void WaitForFirstFrame()
        {
            ExecuteScript("flutter:waitForFirstFrame");
        }

        public void SwitchToAndroidDriver()
            => Context = "NATIVE_APP";

        public void SwitchToFlutterDriver()
            => Context = "FLUTTER";

        public FlutterElement WaitForElementToBeVisible(FlutterBy by, int wait = 60)
        {
            var id = (string)ExecuteScript("flutter:waitFor", by.SerializedSearchCriteria, wait * 1000);
            return new FlutterElement(this, id);
        }


        public FlutterElement WaitForElementToBeClickable(FlutterBy by, int wait = 60)
        {
            var id = (string)ExecuteScript("flutter:waitForTappable", by.SerializedSearchCriteria, wait * 1000);
            return new FlutterElement(this, id);
        }

        public void SetFrameSync(bool isSet, int wait = 60)
        {
            ExecuteScript("flutter:setFrameSync", isSet, wait * 1000);
        }
        public void WaitForAbscense(FlutterBy by, int wait = 60)
            => ExecuteScript("flutter:waitForAbsent", by.SerializedSearchCriteria, wait * 1000);

        public void SaveScreenshot(string name)
        {
            var screenshot = GetScreenshot();
            screenshot.SaveAsFile(name);
        }

        public void RunUnsynchronized(Action action)
        {
            SetFrameSync(false);
            action.Invoke();
            SetFrameSync(true);
        }
        public void Click(FlutterBy by)
            => new FlutterElement(this, by.SerializedSearchCriteria).Click();

        public void Tap(double x, double y, long? count = null)
        {
            SwitchToAndroidDriver();
            new TouchAction(this).Tap(x, y, count).Perform();
            SwitchToFlutterDriver();
        }



        public void PageBack()
            => new FlutterElement(this, FlutterBy.PageBack().SerializedSearchCriteria).Click();

    }
}
