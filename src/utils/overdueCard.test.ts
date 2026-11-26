import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BrandAccent, LateStatus, SoftPopColors } from '../constants/theme';
import { isPunishingStatusColor, OVERDUE_TAG, overdueScheduleAppearance } from './overdueCard';

const root = join(__dirname, '..', '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('overdue schedule card', () => {
  it('keeps the normal card and shows an amber 시간 지남 tag', () => {
    const normal = '#F3E5F5';
    const look = overdueScheduleAppearance(normal);
    assert.equal(look.card.backgroundColor, normal);
    assert.equal(look.card.borderColor, SoftPopColors.white);
    assert.equal(look.tag.text, OVERDUE_TAG);
    assert.equal(look.tag.text, '시간 지남');
    assert.equal(look.tag.textColor, LateStatus.text);
    assert.equal(look.tag.iconColor, LateStatus.icon);
    assert.equal(look.tag.backgroundColor, LateStatus.soft);
    for (const color of [
      look.card.backgroundColor,
      look.card.borderColor,
      look.tag.textColor,
      look.tag.iconColor,
      look.tag.backgroundColor,
    ]) {
      assert.equal(isPunishingStatusColor(color), false, color);
    }
    assert.notEqual(look.card.backgroundColor, '#FFF0F0');
    assert.notEqual(look.card.borderColor, SoftPopColors.error);
    assert.notEqual(look.tag.textColor, BrandAccent.text);
  });

  it('falls back to a white card when the activity has no surface', () => {
    const look = overdueScheduleAppearance('');
    assert.equal(look.card.backgroundColor, SoftPopColors.white);
    assert.equal(look.card.borderColor, SoftPopColors.white);
  });

  it('the Today card uses that appearance and does not paint missed items red', () => {
    const source = read('src/components/TodayScheduleItem.tsx');
    assert.match(source, /overdueScheduleAppearance/);
    assert.match(source, /completeSurface/);
    assert.equal(source.includes('#FFF0F0'), false);
    assert.equal(source.includes('borderColor: SoftPopColors.error'), false);
    const missed = source.slice(source.indexOf("case 'missed':"), source.indexOf("case 'future':"));
    assert.equal(missed.includes('SoftPopColors.error'), false);
    assert.equal(missed.includes('BrandAccent'), false);
  });
});
