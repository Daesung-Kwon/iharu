import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SoftPopColors } from './theme';

describe('SoftPopColors role colours', () => {
  it('partial-completion dot is soft blue', () => {
    assert.equal(SoftPopColors.partial, '#5B8DEF');
  });

  it('partial never reuses another status colour (esp. today orange)', () => {
    const others = {
      today: SoftPopColors.today,
      now: SoftPopColors.now,
      complete: SoftPopColors.complete,
      primary: SoftPopColors.primary,
    };
    for (const [role, color] of Object.entries(others)) {
      assert.notEqual(
        SoftPopColors.partial.toLowerCase(),
        color.toLowerCase(),
        `partial must differ from ${role}`,
      );
    }
  });
});
