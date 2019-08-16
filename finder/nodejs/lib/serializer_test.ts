
// tslint:disable:object-literal-sort-keys
import expect from 'expect';
import * as spec from '../../spec.json';
import * as find from './serializer';

describe(`serializer`, () => {
  it(`ancestor`, () => {
    const expected = find.ancestor({
      of: find.bySemanticsLabel(RegExp(`counter_semantic`)),
      matching: find.byType(`Tooltip`),
    });
    expect(expected).toBe(spec.ancestor);
  });
});
