import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as find from './serializer.js';

void describe(`serializer`, () => {
  void it(`ancestor`, () => {
    const expected = `eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJmaXJzdE1hdGNoT25seSI6InRydWUiLCJtYXRjaFJvb3QiOiJmYWxzZSIsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiQW5jZXN0b3JcIixcImZpcnN0TWF0Y2hPbmx5XCI6XCJmYWxzZVwiLFwibWF0Y2hSb290XCI6XCJmYWxzZVwiLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9IiwibWF0Y2hpbmciOiJ7XCJmaW5kZXJUeXBlXCI6XCJBbmNlc3RvclwiLFwiZmlyc3RNYXRjaE9ubHlcIjpcImZhbHNlXCIsXCJtYXRjaFJvb3RcIjpcImZhbHNlXCIsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0ifQ`;
    const observed = find.ancestor({
      of: find.ancestor({
        of: find.pageBack(),
        matching: find.pageBack(),
      }),
      matching: find.ancestor({
        of: find.pageBack(),
        matching: find.pageBack(),
      }),
      firstMatchOnly: true,
    });
    assert.strictEqual(observed, expected);
  });
  void it(`descendant`, () => {
    const expected = `eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsImZpcnN0TWF0Y2hPbmx5IjoiZmFsc2UiLCJtYXRjaFJvb3QiOiJmYWxzZSIsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiRGVzY2VuZGFudFwiLFwiZmlyc3RNYXRjaE9ubHlcIjpcImZhbHNlXCIsXCJtYXRjaFJvb3RcIjpcImZhbHNlXCIsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0iLCJtYXRjaGluZyI6IntcImZpbmRlclR5cGVcIjpcIkRlc2NlbmRhbnRcIixcImZpcnN0TWF0Y2hPbmx5XCI6XCJmYWxzZVwiLFwibWF0Y2hSb290XCI6XCJmYWxzZVwiLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0`;
    const observed = find.descendant({
      of: find.descendant({
        of: find.pageBack(),
        matching: find.pageBack(),
      }),
      matching: find.descendant({
        of: find.pageBack(),
        matching: find.pageBack(),
      }),
    });
    assert.strictEqual(observed, expected);
  });
  void it(`text`, () => {
    const expected = find.byText(`This is 2nd route`);
    assert.strictEqual(expected, `eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0`);
  });
  void it(`pageBack`, () => {
    const expected = find.pageBack();
    assert.strictEqual(expected, `eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ`);
  });
  void it(`bySemanticsLabel String`, () => {
    const expected = find.bySemanticsLabel(`simple`);
    assert.strictEqual(
      expected,
      `eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ`,
    );
  });
  void it(`bySemanticsLabel RegEx`, () => {
    const expected = find.bySemanticsLabel(/complicated/);
    assert.strictEqual(
      expected,
      `eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0`,
    );
  });
  void it(`byValueKey String`, () => {
    const expected = find.byValueKey(`42`);
    assert.strictEqual(
      expected,
      `eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ`,
    );
  });
  void it(`byValueKey Int`, () => {
    const expected = find.byValueKey(42);
    assert.strictEqual(
      expected,
      `eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0`,
    );
  });
  void it(`byTooltip`, () => {
    const expected = find.byTooltip(`myText`);
    assert.strictEqual(expected, `eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ`);
  });
  void it(`byType`, () => {
    const expected = find.byType(`myText`);
    assert.strictEqual(expected, `eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9`);
  });
});
