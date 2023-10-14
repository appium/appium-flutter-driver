// tslint:disable:object-literal-sort-keys
import expect from 'expect';
import * as find from './serializer';

describe(`serializer`, () => {
  it(`ancestor`, () => {
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
    expect(observed).toBe(expected);
  });
  it(`descendant`, () => {
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
    expect(observed).toBe(expected);
  });
  it(`text`, () => {
    const expected = find.byText(`This is 2nd route`);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlUZXh0IiwidGV4dCI6IlRoaXMgaXMgMm5kIHJvdXRlIn0`,
    );
  });
  it(`pageBack`, () => {
    const expected = find.pageBack();
    expect(expected).toBe(`eyJmaW5kZXJUeXBlIjoiUGFnZUJhY2sifQ`);
  });
  it(`bySemanticsLabel String`, () => {
    const expected = find.bySemanticsLabel(`simple`);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjpmYWxzZSwibGFiZWwiOiJzaW1wbGUifQ`,
    );
  });
  it(`bySemanticsLabel RegEx`, () => {
    const expected = find.bySemanticsLabel(/complicated/);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlTZW1hbnRpY3NMYWJlbCIsImlzUmVnRXhwIjp0cnVlLCJsYWJlbCI6ImNvbXBsaWNhdGVkIn0`,
    );
  });
  it(`byValueKey String`, () => {
    const expected = find.byValueKey(`42`);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjoiNDIiLCJrZXlWYWx1ZVR5cGUiOiJTdHJpbmcifQ`,
    );
  });
  it(`byValueKey Int`, () => {
    const expected = find.byValueKey(42);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlWYWx1ZUtleSIsImtleVZhbHVlU3RyaW5nIjo0Miwia2V5VmFsdWVUeXBlIjoiaW50In0`,
    );
  });
  it(`byTooltip`, () => {
    const expected = find.byTooltip(`myText`);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlUb29sdGlwTWVzc2FnZSIsInRleHQiOiJteVRleHQifQ`,
    );
  });
  it(`byType`, () => {
    const expected = find.byType(`myText`);
    expect(expected).toBe(
      `eyJmaW5kZXJUeXBlIjoiQnlUeXBlIiwidHlwZSI6Im15VGV4dCJ9`,
    );
  });
});
