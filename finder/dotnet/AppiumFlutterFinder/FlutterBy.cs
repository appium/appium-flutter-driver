using OpenQA.Selenium;
using System.Text;
using System.Text.RegularExpressions;

namespace AppiumFlutterFinder
{
    public class FlutterBy : By
    {

        internal string SerializedSearchCriteria => Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonSearchCriteria));
        internal string JsonSearchCriteria => Newtonsoft.Json.JsonConvert.SerializeObject(_searchCriteria);

        dynamic _searchCriteria;
        private FlutterBy(dynamic searchCriteria)
        {
            _searchCriteria = searchCriteria;
        }

        public static FlutterBy ByKeyValue(string key) => new FlutterBy(new
        {
            finderType = "ByValueKey",
            keyValueString = key,
            keyValueType = "String",
        });

        public static FlutterBy ByKeyValue(int key) => new FlutterBy(new
        {
            finderType = "ByValueKey",
            keyValueString = key,
            keyValueType = "int",
        });

        public static FlutterBy ByText(string text) => new FlutterBy(new
        {
            finderType = "ByText",
            text
        });
        public static FlutterBy ByTooltip(string text) => new FlutterBy(new
        {
            finderType = "ByTooltipMessage",
            text
        });
        public static FlutterBy ByType(string type) => new FlutterBy(new
        {
            finderType = "ByType",
            type
        });

        public static FlutterBy BySemanticsLabel(string label) => new FlutterBy(new
        {
            finderType = "BySemanticsLabel",
            isRegExp = false,
            label
        });
        public static FlutterBy BySemanticsLabel(Regex pattern) => new FlutterBy(new
        {
            finderType = "BySemanticsLabel",
            isRegExp = true,
            label = pattern.ToString()
        });

        public static FlutterBy PageBack() => new FlutterBy(new
        {
            finderType = "PageBack"
        });

        public static FlutterBy ByAnscestor(FlutterBy of,
                                            FlutterBy matching,
                                            bool matchRoot = false,
                                            bool firstMatchOnly = false)
            => new FlutterBy(new
            {
                finderType = "Ancestor",
                matchRoot = matchRoot.ToString().ToLower(),
                firstMatchOnly = firstMatchOnly.ToString().ToLower(),
                of = of.JsonSearchCriteria,
                matching = matching.JsonSearchCriteria,
            });

        public static FlutterBy ByDescendant(FlutterBy of,
                                             FlutterBy matching,
                                             bool matchRoot = false,
                                             bool firstMatchOnly = false)
            => new FlutterBy(new
            {
                finderType = "Descendant",
                matchRoot = matchRoot.ToString().ToLower(),
                firstMatchOnly = firstMatchOnly.ToString().ToLower(),
                of = of.JsonSearchCriteria,
                matching = matching.JsonSearchCriteria,
            });


    }
}
