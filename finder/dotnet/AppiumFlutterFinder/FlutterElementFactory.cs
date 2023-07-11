using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AppiumFlutterFinder
{
    public class FlutterElementFactory : CachedElementFactory<FlutterElement>
    {
        public FlutterElementFactory(RemoteWebDriver parentDriver): base(parentDriver)
        {
        }

        protected override FlutterElement CreateCachedElement(RemoteWebDriver parentDriver, string elementId)
        {
            return new FlutterElement(parentDriver, id: elementId);
        }
    }
}
