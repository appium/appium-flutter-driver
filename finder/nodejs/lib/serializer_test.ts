// tslint:disable:object-literal-sort-keys
import expect from 'expect';
import * as spec from '../../spec.json';
import * as find from './serializer';

describe(`serializer`, () => {
  it(`ancestor`, () => {
    const expected = `eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOmZhbHNlLCJvZiI6IntcImZpbmRlclR5cGVcIjpcIkFuY2VzdG9yXCIsXCJtYXRjaFJvb3RcIjpmYWxzZSxcIm9mXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCIsXCJtYXRjaGluZ1wiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwifSIsIm1hdGNoaW5nIjoie1wiZmluZGVyVHlwZVwiOlwiQW5jZXN0b3JcIixcIm1hdGNoUm9vdFwiOmZhbHNlLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0`;
    const observed = find.ancestor({
      of: find.ancestor({
        of: find.pageBack(),
        matching: find.pageBack(),
      }),
      matching: find.ancestor({
        of: find.pageBack(),
        matching: find.pageBack(),
      }),
    });
    expect(expected).toBe(observed);
  });
  it(`descendant`, () => {
    const expected = `eyJmaW5kZXJUeXBlIjoiRGVzY2VuZGFudCIsIm1hdGNoUm9vdCI6ZmFsc2UsIm9mIjoie1wiZmluZGVyVHlwZVwiOlwiRGVzY2VuZGFudFwiLFwibWF0Y2hSb290XCI6ZmFsc2UsXCJvZlwiOlwie1xcXCJmaW5kZXJUeXBlXFxcIjpcXFwiUGFnZUJhY2tcXFwifVwiLFwibWF0Y2hpbmdcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIn0iLCJtYXRjaGluZyI6IntcImZpbmRlclR5cGVcIjpcIkRlc2NlbmRhbnRcIixcIm1hdGNoUm9vdFwiOmZhbHNlLFwib2ZcIjpcIntcXFwiZmluZGVyVHlwZVxcXCI6XFxcIlBhZ2VCYWNrXFxcIn1cIixcIm1hdGNoaW5nXCI6XCJ7XFxcImZpbmRlclR5cGVcXFwiOlxcXCJQYWdlQmFja1xcXCJ9XCJ9In0`;
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
