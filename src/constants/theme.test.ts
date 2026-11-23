import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BrandAccent, SheetChrome, SoftPopColors, TabBarColors } from './theme';

function linear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * linear((n >> 16) & 255) +
    0.7152 * linear((n >> 8) & 255) +
    0.0722 * linear(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Old active pill: primary at alpha 0x26 (~15%) over white. */
function legacyWash(): string {
  const alpha = 0x26 / 255;
  const fg = Number.parseInt(SoftPopColors.primary.slice(1), 16);
  const mix = (shift: number) =>
    Math.round((((fg >> shift) & 255) * alpha) + (255 * (1 - alpha)));
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hex(mix(16))}${hex(mix(8))}${hex(mix(0))}`;
}

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

describe('TabBarColors', () => {
  it('selected tab is a soft pill with coral ink, and the bar stays translucent', () => {
    assert.equal(BrandAccent.soft, '#FFEDEA');
    assert.equal(BrandAccent.text, '#D6393E');
    assert.equal(BrandAccent.strong, '#F0565A');
    assert.equal(TabBarColors.activePill, BrandAccent.soft);
    assert.equal(TabBarColors.activePill, '#FFEDEA');
    assert.equal(TabBarColors.activeIcon, BrandAccent.text);
    assert.equal(TabBarColors.activeIcon, '#D6393E');
    assert.equal(TabBarColors.activeLabel, '#D6393E');
    assert.equal(TabBarColors.inactive, '#636E72');
    assert.equal(TabBarColors.inactive, SoftPopColors.textSecondary);
    assert.equal(TabBarColors.bar, 'rgba(255, 255, 255, 0.75)');

    assert.notEqual(TabBarColors.activePill, '#FF6B6B');
    assert.notEqual(TabBarColors.activePill, SoftPopColors.primary);
    assert.notEqual(TabBarColors.activeIcon, SoftPopColors.white);
    assert.notEqual(TabBarColors.inactive, TabBarColors.activeIcon);

    // Icon on the soft pill needs 3:1. #FF6B6B on this pill is about 2.45:1.
    assert.ok(contrast(TabBarColors.activeIcon, TabBarColors.activePill) >= 3);
    assert.ok(contrast('#FF6B6B', TabBarColors.activePill) < 3);
    // Label sits on the white bar, not inside the pill.
    assert.ok(contrast(TabBarColors.activeLabel, '#FFFFFF') >= 4.5);
    assert.ok(contrast(TabBarColors.inactive, '#FFFFFF') >= 4.5);

    const wash = contrast(legacyWash(), '#FFFFFF');
    assert.ok(wash < 1.2);
  });
});

describe('SheetChrome', () => {
  it('bottom sheets share one radius, scrim, and content inset', () => {
    assert.equal(SheetChrome.radius, 32);
    assert.equal(SheetChrome.backdrop, 'rgba(0, 0, 0, 0.5)');
    assert.equal(SheetChrome.paddingHorizontal, 20);
    assert.equal(SheetChrome.paddingTop, 20);
  });
});
