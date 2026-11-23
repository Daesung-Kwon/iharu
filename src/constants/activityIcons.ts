/**
 * Ionicons outline icons for every activity emoji and the other UI glyphs.
 *
 * Stored activities keep their existing `emojiKey` (a preset key such as
 * "homework", or a legacy emoji character). Nothing is migrated. Unknown
 * values render as the pin fallback so a cell is never blank.
 *
 * Outline icons share one stroke. Tile colors are soft pastels; the glyph
 * ink is the same on every screen (`ACTIVITY_ICON_INK`, SoftPopColors.text).
 */

import { ActivityEmojis } from './emojis';

/** Matches SoftPopColors.text so the outline stroke does not vary by screen. */
export const ACTIVITY_ICON_INK = '#2D3436';

/** Glyph size as a fraction of the tile, so the stroke weight stays proportional. */
export const ICON_GLYPH_RATIO = 0.58;

export const PastelTile = {
  sky: '#D9EBFF',
  lilac: '#E6DCFF',
  lemon: '#FFF0C2',
  aqua: '#D4F3F0',
  peach: '#FFD9C8',
  rose: '#FFD6E6',
  mint: '#D5F3E0',
  cream: '#FFE4CC',
  amber: '#FFE4B0',
} as const;

export type PastelTileName = keyof typeof PastelTile;

type IconChoice = {
  icon: string;
  tile: PastelTileName;
};

/**
 * Preset key → Ionicons outline name. Keys match `ActivityEmojis`.
 * The picker stores the key, not the icon name, so older saves keep working.
 */
export const ActivityIconByKey: Record<string, IconChoice> = {
  homework: { icon: 'document-text-outline', tile: 'sky' },
  reading: { icon: 'book-outline', tile: 'lilac' },
  study: { icon: 'pencil-outline', tile: 'lemon' },
  science: { icon: 'flask-outline', tile: 'aqua' },
  math: { icon: 'calculator-outline', tile: 'peach' },
  play: { icon: 'game-controller-outline', tile: 'rose' },
  art: { icon: 'color-palette-outline', tile: 'cream' },
  music: { icon: 'musical-notes-outline', tile: 'lemon' },
  piano: { icon: 'musical-note-outline', tile: 'lilac' },
  dance: { icon: 'body-outline', tile: 'rose' },
  puzzle: { icon: 'extension-puzzle-outline', tile: 'mint' },
  roleplay: { icon: 'happy-outline', tile: 'peach' },
  movie: { icon: 'film-outline', tile: 'sky' },
  exercise: { icon: 'walk-outline', tile: 'mint' },
  swim: { icon: 'water-outline', tile: 'aqua' },
  bike: { icon: 'bicycle-outline', tile: 'sky' },
  outside: { icon: 'leaf-outline', tile: 'mint' },
  meal: { icon: 'nutrition-outline', tile: 'rose' },
  snack: { icon: 'ice-cream-outline', tile: 'cream' },
  nap: { icon: 'bed-outline', tile: 'aqua' },
  rest: { icon: 'fitness-outline', tile: 'lilac' },
  friend: { icon: 'people-outline', tile: 'peach' },
  pets: { icon: 'paw-outline', tile: 'cream' },
  garden: { icon: 'flower-outline', tile: 'lemon' },
  travel: { icon: 'airplane-outline', tile: 'sky' },
  computer: { icon: 'laptop-outline', tile: 'aqua' },
  camera: { icon: 'camera-outline', tile: 'rose' },
  lightbulb: { icon: 'bulb-outline', tile: 'lemon' },
};

/** UI glyphs that are not activity presets. `fallback` replaces the old pin emoji. */
export const UiGlyphs = {
  progressToday: { emoji: '⭐', icon: 'star-outline', tile: 'lemon' },
  progressPast: { emoji: '📊', icon: 'stats-chart-outline', tile: 'sky' },
  celebration: { emoji: '🎉', icon: 'balloon-outline', tile: 'rose' },
  encouragement: { emoji: '💪', icon: 'barbell-outline', tile: 'peach' },
  overlap: { emoji: '⚠️', icon: 'warning-outline', tile: 'amber' },
  planHint: { emoji: '✨', icon: 'sparkles-outline', tile: 'lemon' },
  fallback: { emoji: '📌', icon: 'pin-outline', tile: 'lilac' },
  complete: { emoji: '✓', icon: 'checkmark-outline', tile: 'mint' },
  dismiss: { emoji: '✕', icon: 'close-outline', tile: 'rose' },
} as const;

export type UiGlyphId = keyof typeof UiGlyphs;

export const FALLBACK_ACTIVITY_ICON = UiGlyphs.fallback.icon;

export type ResolvedActivityIcon = {
  /** Ionicons outline name. Always set. */
  icon: string;
  /** Soft pastel tile fill. */
  tile: string;
  /** Preset key when `stored` is that key or its emoji. Null for the fallback. */
  key: string | null;
  matched: boolean;
};

const VARIATION_SELECTORS = /[\uFE0F\u200D]/g;

const normalizeStored = (value: string): string => value.trim().replace(VARIATION_SELECTORS, '');

const emojiToKey: Record<string, string> = {};
for (const [key, emoji] of Object.entries(ActivityEmojis)) {
  emojiToKey[emoji] = key;
  emojiToKey[normalizeStored(emoji)] = key;
}

const resolvedFromKey = (key: string): ResolvedActivityIcon => {
  const choice = ActivityIconByKey[key];
  return {
    icon: choice.icon,
    tile: PastelTile[choice.tile],
    key,
    matched: true,
  };
};

const fallbackIcon = (): ResolvedActivityIcon => ({
  icon: FALLBACK_ACTIVITY_ICON,
  tile: PastelTile[UiGlyphs.fallback.tile],
  key: null,
  matched: false,
});

/**
 * Map a stored activity value to an outline icon.
 * Accepts a preset key (`homework`) or the emoji that key used to display (`📝`).
 * Null, blank, and anything we do not know become the pin outline.
 */
export function resolveActivityIcon(stored: string | null | undefined): ResolvedActivityIcon {
  if (typeof stored !== 'string') return fallbackIcon();
  const raw = stored.trim();
  if (!raw) return fallbackIcon();
  if (ActivityIconByKey[raw]) return resolvedFromKey(raw);
  const byEmoji = emojiToKey[raw] ?? emojiToKey[normalizeStored(raw)];
  if (byEmoji && ActivityIconByKey[byEmoji]) return resolvedFromKey(byEmoji);
  return fallbackIcon();
}

export function uiGlyph(id: UiGlyphId): { icon: string; tile: string; emoji: string } {
  const glyph = UiGlyphs[id];
  return { icon: glyph.icon, tile: PastelTile[glyph.tile], emoji: glyph.emoji };
}
