import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {decode, encode} from './base64url.js';

void describe(`base64url`, () => {
  void it(`decode multiple occurrences of +/=`, () => {
    assert.strictEqual(decode(`1L3Xst+9zp/Gncqt1rXTkde92onGrN6ozq/dpdyX3ZnEu9+TyIhhYQ==`), `Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`);
    assert.strictEqual(decode(`1L3Xst-9zp_Gncqt1rXTkde92onGrN6ozq_dpdyX3ZnEu9-TyIhhYQ`), `Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`);
  });
  void it(`encode multiple occurrences of +/=`, () => {
    assert.strictEqual(encode(`Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`), `1L3Xst-9zp_Gncqt1rXTkde92onGrN6ozq_dpdyX3ZnEu9-TyIhhYQ`);
  });
  void describe(`decode`, () => {
    void it(`decode MJSONWP element object`, () => {
      assert.strictEqual(
        decode({ELEMENT: `1L3Xst+9zp/Gncqt1rXTkde92onGrN6ozq/dpdyX3ZnEu9+TyIhhYQ==`}),
        `Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`,
      );
    });
    void it(`decode W3C element object`, () => {
      assert.strictEqual(
        decode({'element-6066-11e4-a52e-4f735466cecf': `1L3Xst+9zp/Gncqt1rXTkde92onGrN6ozq/dpdyX3ZnEu9+TyIhhYQ==`}),
        `Խײ߽ΟƝʭֵӑ׽ډƬިίݥܗݙĻߓȈaa`,
      );
    });
    void it(`throws Error for strange object`, () => {
      assert.throws(() => decode({foo: `bar`}));
    });
  });
});
