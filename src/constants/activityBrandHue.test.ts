import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ActivityBrandHue, activityBrandHue } from './activityIcons';

describe('activity brand hue (Activity tab cards)', () => {
  it('covers the 8 activity colorKeys with the brand-guide tint/ink pairs', () => {
    assert.deepEqual(Object.keys(ActivityBrandHue).sort(), [
      'blue', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow',
    ]);
    assert.deepEqual(activityBrandHue('blue'), { tint: '#E7F0FF', ink: '#3D7BE0' });
    assert.deepEqual(activityBrandHue('teal'), { tint: '#E0F4F1', ink: '#1A8A7F' });
  });

  it('falls back to purple for an unknown or missing colorKey', () => {
    assert.deepEqual(activityBrandHue('nope'), ActivityBrandHue.purple);
    assert.deepEqual(activityBrandHue(undefined), ActivityBrandHue.purple);
  });

  it('the card uses the brand hue and the mockup geometry; Today/Plan tiles do not', () => {
    const card = readFileSync('src/components/ActivityCard.tsx', 'utf8');
    for (const token of [
      'activityBrandHue(activity.colorKey)',
      'ACTIVITY_CARD_TILE = 52',
      'ACTIVITY_CARD_TILE_RADIUS = 16',
      'ACTIVITY_CARD_GLYPH = 28',
      'ACTIVITY_CARD_RADIUS = 24',
      'backgroundColor: SoftPopColors.white',
      "alignItems: 'flex-start'",
    ]) {
      assert.ok(card.includes(token), token);
    }
    assert.equal(card.includes('ActivityMaterialColors'), false);
    assert.equal(card.includes('borderWidth'), false);
    assert.equal(readFileSync('src/components/ActivityIcon.tsx', 'utf8').includes('ActivityBrandHue'), false);
  });
});
