// tslint:disable:object-literal-sort-keys
import expect from 'expect';
import * as spec from '../../spec.json';
import * as find from './serializer';

describe(`serializer`, () => {
  it(`ancestor`, () => {
    const expected = `eyJmaW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaFJvb3QiOmZhbHNlLCJvZl9maW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJvZl9tYXRjaFJvb3QiOmZhbHNlLCJvZl9vZl9maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJvZl9tYXRjaGluZ19maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJtYXRjaGluZ19maW5kZXJUeXBlIjoiQW5jZXN0b3IiLCJtYXRjaGluZ19tYXRjaFJvb3QiOmZhbHNlLCJtYXRjaGluZ19vZl9maW5kZXJUeXBlIjoiUGFnZUJhY2siLCJtYXRjaGluZ19tYXRjaGluZ19maW5kZXJUeXBlIjoiUGFnZUJhY2sifQ`;
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
