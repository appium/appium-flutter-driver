import expect from 'expect';
import { decode, encode } from './base64url';

describe(`base64url`, () => {
  it(`decode multiple occurrences of +/=`, () => {
    expect(decode(`1L3Xst+9zp/Gncqt1rXTkde92onGrN6ozq/dpdyX3ZnEu9+TyIhhYQ==`)).toBe(`Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`);
    expect(decode(`1L3Xst-9zp_Gncqt1rXTkde92onGrN6ozq_dpdyX3ZnEu9-TyIhhYQ`)).toBe(`Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`);
  });
  it(`encode multiple occurrences of +/=`, () => {
    expect(encode(`Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`)).toBe(`1L3Xst-9zp_Gncqt1rXTkde92onGrN6ozq_dpdyX3ZnEu9-TyIhhYQ`);
  });
  describe(`decode`, () => {
    it(`decode MJSONWP element object`, () => {
      expect(decode({ ELEMENT: `1L3Xst+9zp/Gncqt1rXTkde92onGrN6ozq/dpdyX3ZnEu9+TyIhhYQ==` }))
        .toBe(`Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`);
    });
    it(`decode W3C element object`, () => {
      expect(decode({ 'element-6066-11e4-a52e-4f735466cecf': `1L3Xst+9zp/Gncqt1rXTkde92onGrN6ozq/dpdyX3ZnEu9+TyIhhYQ==` }))
        .toBe(`Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`);
    });
    it(`throws Error for strang object`, () => {
      expect(() => decode({ foo: `bar` })).toThrow();
    });
  });
});
