import test from 'node:test';
import assert from 'node:assert/strict';
import { ActivityEmojis } from './emojis';
import {
  ActivityIconByKey,
  FALLBACK_ACTIVITY_ICON,
  PastelTile,
  UiGlyphs,
  resolveActivityIcon,
  uiGlyph,
} from './activityIcons';
import { resolveIhIconName } from '../components/icons/ihIconPaths';

const EXPECTED: Record<string, { emoji: string; icon: string }> = {
  homework: { emoji: '📝', icon: 'ih-homework' },
  reading: { emoji: '📚', icon: 'ih-reading' },
  study: { emoji: '✏️', icon: 'ih-study' },
  science: { emoji: '🔬', icon: 'ih-science' },
  math: { emoji: '➕', icon: 'ih-math' },
  play: { emoji: '🎮', icon: 'ih-play' },
  art: { emoji: '🎨', icon: 'ih-art' },
  music: { emoji: '🎵', icon: 'ih-music' },
  piano: { emoji: '🎹', icon: 'ih-piano' },
  dance: { emoji: '💃', icon: 'ih-dance' },
  puzzle: { emoji: '🧩', icon: 'ih-puzzle' },
  roleplay: { emoji: '🎭', icon: 'ih-roleplay' },
  movie: { emoji: '🎬', icon: 'ih-movie' },
  exercise: { emoji: '🏃', icon: 'ih-exercise' },
  swim: { emoji: '🏊', icon: 'ih-swim' },
  bike: { emoji: '🚴', icon: 'ih-bike' },
  outside: { emoji: '🌳', icon: 'ih-outside' },
  meal: { emoji: '🍎', icon: 'ih-meal' },
  snack: { emoji: '🍪', icon: 'ih-snack' },
  nap: { emoji: '😴', icon: 'ih-nap' },
  rest: { emoji: '🧘', icon: 'ih-rest' },
  friend: { emoji: '👫', icon: 'ih-friend' },
  pets: { emoji: '🐕', icon: 'ih-pets' },
  garden: { emoji: '🌻', icon: 'ih-garden' },
  travel: { emoji: '✈️', icon: 'ih-travel' },
  computer: { emoji: '💻', icon: 'ih-computer' },
  camera: { emoji: '📷', icon: 'ih-camera' },
  lightbulb: { emoji: '💡', icon: 'ih-lightbulb' },
};

test('every activity emoji maps to ih-{key}', () => {
  assert.deepEqual(Object.keys(ActivityIconByKey).sort(), Object.keys(ActivityEmojis).sort());
  assert.equal(Object.keys(EXPECTED).length, Object.keys(ActivityEmojis).length);
  const icons = new Set<string>();
  for (const [key, expected] of Object.entries(EXPECTED)) {
    assert.equal(ActivityEmojis[key], expected.emoji, key);
    assert.equal(ActivityIconByKey[key].icon, expected.icon, key);
    assert.equal(expected.icon, `ih-${key}`, key);
    assert.equal(resolveIhIconName(expected.icon), expected.icon, expected.icon);
    icons.add(expected.icon);
  }
  assert.equal(icons.size, Object.keys(EXPECTED).length);
});

test('preset keys and the emoji strings they used to show resolve to the same icon', () => {
  for (const [key, expected] of Object.entries(EXPECTED)) {
    const fromKey = resolveActivityIcon(key);
    const fromEmoji = resolveActivityIcon(expected.emoji);
    assert.equal(fromKey.matched, true);
    assert.equal(fromKey.key, key);
    assert.equal(fromKey.icon, expected.icon);
    assert.equal(fromEmoji.icon, fromKey.icon);
    assert.equal(fromEmoji.key, key);
    assert.equal(fromEmoji.tile, fromKey.tile);
    assert.match(fromKey.tile, /^#[0-9A-F]{6}$/);
  }
});

test('stored emoji still matches after variation selectors are added or removed', () => {
  const homework = ActivityEmojis.homework;
  assert.equal(resolveActivityIcon(`${homework}\uFE0F`).key, 'homework');
  assert.equal(resolveActivityIcon(`  ${homework}  `).icon, 'ih-homework');
  const travel = ActivityEmojis.travel;
  const stripped = travel.replace(/\uFE0F/g, '');
  assert.equal(resolveActivityIcon(stripped).key, 'travel');
  assert.equal(resolveActivityIcon(stripped).icon, 'ih-travel');
  assert.equal(resolveActivityIcon(`${stripped}\uFE0F`).icon, 'ih-travel');
});

test('unknown, blank, and missing values fall back to ih-pin on lilac', () => {
  const samples: Array<string | null | undefined> = [
    null,
    undefined,
    '',
    '   ',
    'not-an-icon',
    '😀',
    '🎯',
    'book-outline',
    '📌',
  ];
  for (const sample of samples) {
    const resolved = resolveActivityIcon(sample);
    assert.equal(resolved.icon, FALLBACK_ACTIVITY_ICON);
    assert.equal(resolved.icon, 'ih-pin');
    assert.equal(resolveIhIconName(resolved.icon), 'ih-pin');
    assert.equal(resolved.matched, false);
    assert.equal(resolved.key, null);
    assert.equal(resolved.tile, PastelTile.lilac);
    assert.equal(resolved.tile, '#E6DCFF');
  }
});

test('UI glyphs use ih-* names on the same pastel tiles', () => {
  const expected = {
    progressToday: { emoji: '⭐', icon: 'ih-star' },
    progressPast: { emoji: '📊', icon: 'ih-chart' },
    celebration: { emoji: '🎉', icon: 'ih-party' },
    encouragement: { emoji: '💪', icon: 'ih-cheer' },
    overlap: { emoji: '⚠️', icon: 'ih-warn' },
    planHint: { emoji: '✨', icon: 'ih-sparkle' },
    fallback: { emoji: '📌', icon: 'ih-pin' },
    complete: { emoji: '✓', icon: 'ih-check' },
    dismiss: { emoji: '✕', icon: 'ih-close' },
  };
  for (const [id, spec] of Object.entries(expected)) {
    const glyph = UiGlyphs[id as keyof typeof UiGlyphs];
    assert.equal(glyph.emoji, spec.emoji);
    assert.equal(glyph.icon, spec.icon);
    assert.equal(resolveIhIconName(spec.icon), spec.icon, spec.icon);
    const rendered = uiGlyph(id as keyof typeof UiGlyphs);
    assert.equal(rendered.icon, spec.icon);
    assert.match(rendered.tile, /^#[0-9A-F]{6}$/);
  }
  assert.equal(uiGlyph('fallback').tile, PastelTile.lilac);
});

test('choosing an icon stores the preset key, which still resolves', () => {
  const stored = 'snack';
  assert.equal(resolveActivityIcon(stored).key, stored);
  assert.equal(resolveActivityIcon(stored).icon, 'ih-snack');
  assert.equal(resolveActivityIcon('🍪').icon, resolveActivityIcon(stored).icon);
});
