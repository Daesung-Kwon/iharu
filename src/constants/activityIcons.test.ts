import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ActivityEmojis } from './emojis';
import {
  ActivityIconByKey,
  FALLBACK_ACTIVITY_ICON,
  UiGlyphs,
  resolveActivityIcon,
  uiGlyph,
} from './activityIcons';

const glyphMap = JSON.parse(
  readFileSync(
    join(
      __dirname,
      '../../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json',
    ),
    'utf8',
  ),
) as Record<string, number>;

const EXPECTED: Record<string, { emoji: string; icon: string }> = {
  homework: { emoji: '📝', icon: 'document-text-outline' },
  reading: { emoji: '📚', icon: 'book-outline' },
  study: { emoji: '✏️', icon: 'pencil-outline' },
  science: { emoji: '🔬', icon: 'flask-outline' },
  math: { emoji: '➕', icon: 'calculator-outline' },
  play: { emoji: '🎮', icon: 'game-controller-outline' },
  art: { emoji: '🎨', icon: 'color-palette-outline' },
  music: { emoji: '🎵', icon: 'musical-notes-outline' },
  piano: { emoji: '🎹', icon: 'musical-note-outline' },
  dance: { emoji: '💃', icon: 'body-outline' },
  puzzle: { emoji: '🧩', icon: 'extension-puzzle-outline' },
  roleplay: { emoji: '🎭', icon: 'happy-outline' },
  movie: { emoji: '🎬', icon: 'film-outline' },
  exercise: { emoji: '🏃', icon: 'walk-outline' },
  swim: { emoji: '🏊', icon: 'water-outline' },
  bike: { emoji: '🚴', icon: 'bicycle-outline' },
  outside: { emoji: '🌳', icon: 'leaf-outline' },
  meal: { emoji: '🍎', icon: 'nutrition-outline' },
  snack: { emoji: '🍪', icon: 'ice-cream-outline' },
  nap: { emoji: '😴', icon: 'bed-outline' },
  rest: { emoji: '🧘', icon: 'fitness-outline' },
  friend: { emoji: '👫', icon: 'people-outline' },
  pets: { emoji: '🐕', icon: 'paw-outline' },
  garden: { emoji: '🌻', icon: 'flower-outline' },
  travel: { emoji: '✈️', icon: 'airplane-outline' },
  computer: { emoji: '💻', icon: 'laptop-outline' },
  camera: { emoji: '📷', icon: 'camera-outline' },
  lightbulb: { emoji: '💡', icon: 'bulb-outline' },
};

test('every activity emoji has one Ionicons outline icon', () => {
  assert.deepEqual(Object.keys(ActivityIconByKey).sort(), Object.keys(ActivityEmojis).sort());
  assert.equal(Object.keys(EXPECTED).length, Object.keys(ActivityEmojis).length);
  const icons = new Set<string>();
  for (const [key, expected] of Object.entries(EXPECTED)) {
    assert.equal(ActivityEmojis[key], expected.emoji, key);
    assert.equal(ActivityIconByKey[key].icon, expected.icon, key);
    assert.equal(expected.icon.endsWith('-outline'), true, key);
    assert.equal(expected.icon in glyphMap, true, expected.icon);
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
  assert.equal(resolveActivityIcon(`  ${homework}  `).icon, 'document-text-outline');
  const travel = ActivityEmojis.travel;
  const stripped = travel.replace(/\uFE0F/g, '');
  assert.equal(resolveActivityIcon(stripped).key, 'travel');
  assert.equal(resolveActivityIcon(stripped).icon, 'airplane-outline');
  assert.equal(resolveActivityIcon(`${stripped}\uFE0F`).icon, 'airplane-outline');
});

test('unknown, blank, and missing values fall back to the pin outline', () => {
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
    assert.equal(resolved.icon, 'pin-outline');
    assert.equal(resolved.icon in glyphMap, true);
    assert.equal(resolved.matched, false);
    assert.equal(resolved.key, null);
    assert.ok(resolved.tile);
  }
});

test('UI glyphs are outline icons in the Ionicons font', () => {
  const expected = {
    progressToday: { emoji: '⭐', icon: 'star-outline' },
    progressPast: { emoji: '📊', icon: 'stats-chart-outline' },
    celebration: { emoji: '🎉', icon: 'balloon-outline' },
    encouragement: { emoji: '💪', icon: 'barbell-outline' },
    overlap: { emoji: '⚠️', icon: 'warning-outline' },
    planHint: { emoji: '✨', icon: 'sparkles-outline' },
    fallback: { emoji: '📌', icon: 'pin-outline' },
    complete: { emoji: '✓', icon: 'checkmark-outline' },
    dismiss: { emoji: '✕', icon: 'close-outline' },
  };
  for (const [id, spec] of Object.entries(expected)) {
    const glyph = UiGlyphs[id as keyof typeof UiGlyphs];
    assert.equal(glyph.emoji, spec.emoji);
    assert.equal(glyph.icon, spec.icon);
    assert.equal(spec.icon.endsWith('-outline'), true);
    assert.equal(spec.icon in glyphMap, true, spec.icon);
    const rendered = uiGlyph(id as keyof typeof UiGlyphs);
    assert.equal(rendered.icon, spec.icon);
    assert.match(rendered.tile, /^#[0-9A-F]{6}$/);
  }
});

test('choosing an icon stores the preset key, which still resolves', () => {
  const stored = 'snack';
  assert.equal(resolveActivityIcon(stored).key, stored);
  assert.equal(resolveActivityIcon(stored).icon, 'ice-cream-outline');
  assert.equal(resolveActivityIcon('🍪').icon, resolveActivityIcon(stored).icon);
});
