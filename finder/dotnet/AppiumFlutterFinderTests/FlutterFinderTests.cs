using AppiumFlutterFinder;
using System.Text.RegularExpressions;

namespace AppiumFlutterFinderTests
{
    public class Tests
    {

        [Test]
        public void TestByAncestor()
        {
            var element = new FlutterElement(null, FlutterBy.ByAnscestor(
                FlutterBy.ByAnscestor(FlutterBy.PageBack(),
                                      FlutterBy.PageBack()),
                FlutterBy.ByAnscestor(FlutterBy.PageBack(),
                                      FlutterBy.PageBack()),
                firstMatchOnly: true
                ));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOiJmYWxzZSIsImZpcnN0TWF0Y2hPbmx5IjoidHJ1ZSIsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiQW5jZXN0b3JcIixcIm1hdGNoUm9vdFwiOlwiZmFsc2VcIixcImZpcnN0TWF0Y2hPbmx5XCI6XCJmYWxzZVwiLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9IiwibWF0Y2hpbmciOiJ7XCJmaW5kZXJUeXBlXCI6XCJBbmNlc3RvclwiLFwibWF0Y2hSb290XCI6XCJmYWxzZVwiLFwiZmlyc3RNYXRjaE9ubHlcIjpcImZhbHNlXCIsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0ifQ==", element.Id);
        }

        [Test]
        public void TestBydescendant()
        {
            var element = new FlutterElement(null, FlutterBy.ByDescendant(
                FlutterBy.ByDescendant(FlutterBy.PageBack(),
                                      FlutterBy.PageBack()),
                FlutterBy.ByDescendant(FlutterBy.PageBack(),
                                      FlutterBy.PageBack())
                ));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsIm1hdGNoUm9vdCI6ImZhbHNlIiwiZmlyc3RNYXRjaE9ubHkiOiJmYWxzZSIsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiRGVzY2VuZGFudFwiLFwibWF0Y2hSb290XCI6XCJmYWxzZVwiLFwiZmlyc3RNYXRjaE9ubHlcIjpcImZhbHNlXCIsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0iLCJtYXRjaGluZyI6IntcImZpbmRlclR5cGVcIjpcIkRlc2NlbmRhbnRcIixcIm1hdGNoUm9vdFwiOlwiZmFsc2VcIixcImZpcnN0TWF0Y2hPbmx5XCI6XCJmYWxzZVwiLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0=", element.Id);
        }

        [Test]
        public void test_by_semantics_label()
        {
            var element = new FlutterElement(null, FlutterBy.BySemanticsLabel("simple"));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ==", element.Id);
        }

        [Test]
        public void TestBySemanticsLabelRegex()
        {
            var element = new FlutterElement(null, FlutterBy.BySemanticsLabel(new Regex("complicated")));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0=", element.Id);
        }
        [Test]
        public void TestByTooltip()
        {
            var element = new FlutterElement(null, FlutterBy.ByTooltip("myText"));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ==", element.Id);
        }

        [Test]
        public void TestByType()
        {
            var element = new FlutterElement(null, FlutterBy.ByType("myText"));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9", element.Id);
        }

        [Test]
        public void TestByValueKeyInt()
        {
            var element = new FlutterElement(null, FlutterBy.ByKeyValue(42));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0=", element.Id);
        }

        [Test]
        public void TestByValueKeyString()
        {
            var element = new FlutterElement(null, FlutterBy.ByKeyValue("42"));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ==", element.Id);
        }

        [Test]
        public void TestPageBack()
        {
            var element = new FlutterElement(null, FlutterBy.PageBack());
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ==", element.Id);
        }

        [Test]
        public void TestByText()
        {
            var element = new FlutterElement(null, FlutterBy.ByText("This is 2nd route"));
            Assert.AreEqual("eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0=", element.Id);
        }

    }
}