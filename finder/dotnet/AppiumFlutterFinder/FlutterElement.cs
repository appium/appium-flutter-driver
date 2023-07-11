using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AppiumFlutterFinder
{
    public class FlutterElement : AppiumWebElement
    {
        public FlutterElement(RemoteWebDriver parent, FlutterBy by) : base(parent, by.SerializedSearchCriteria)
        {

        }
        public FlutterElement(RemoteWebDriver parent, string id) : base(parent, id)
        {
        }

        public void FocusAndSendKeys(string text)
        {
            Click();
            SendKeys(text);
        }
    }
}
