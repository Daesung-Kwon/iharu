/**
 * In-house `ih-*` icons for every activity emoji and the other UI glyphs.
 *
 * Stored activities keep their existing `emojiKey` (a preset key such as
 * "homework", or a legacy emoji character). Nothing is migrated. Unknown
 * values render as `ih-pin` on the lilac tile so a cell is never blank.
 *
 * Tile colors stay the soft pastels. The glyph ink is `ACTIVITY_ICON_INK`
 * (the SVG ink, SoftPopColors.text) unless a caller tints it.
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

/**
 * Brand activity hues (brand-guide §3): tint tile + darker ink of the same hue,
 * icon contrast 3:1 or more. Keyed by Activity.colorKey. Used on the Activity
 * tab cards only for now; Today and Plan keep PastelTile.
 */
export const ActivityBrandHue = {
  blue: { tint: '#E7F0FF', ink: '#3D7BE0' },
  purple: { tint: '#F1EBFD', ink: '#8A5CD6' },
  pink: { tint: '#FFE9F1', ink: '#C8457E' },
  green: { tint: '#E5F5E9', ink: '#2F8F50' },
  orange: { tint: '#FFF0E0', ink: '#C96A12' },
  yellow: { tint: '#FFF6D6', ink: '#A67B00' },
  red: { tint: '#FFEAE8', ink: '#DE5248' },
  teal: { tint: '#E0F4F1', ink: '#1A8A7F' },
} as const;

export type ActivityBrandHueName = keyof typeof ActivityBrandHue;

/** Unknown or missing colorKey falls back to purple so a card is never blank. */
export function activityBrandHue(colorKey: string | null | undefined) {
  return ActivityBrandHue[(colorKey ?? '') as ActivityBrandHueName] ?? ActivityBrandHue.purple;
}

type IconChoice = {
  icon: string;
  tile: PastelTileName;
};

/**
 * Preset key → `ih-{key}`. Keys match `ActivityEmojis`.
 * The picker stores the key, not the icon name, so older saves keep working.
 */
export const ActivityIconByKey: Record<string, IconChoice> = {
  homework: { icon: 'ih-homework', tile: 'sky' },
  reading: { icon: 'ih-reading', tile: 'lilac' },
  study: { icon: 'ih-study', tile: 'lemon' },
  science: { icon: 'ih-science', tile: 'aqua' },
  math: { icon: 'ih-math', tile: 'peach' },
  play: { icon: 'ih-play', tile: 'rose' },
  art: { icon: 'ih-art', tile: 'cream' },
  music: { icon: 'ih-music', tile: 'lemon' },
  piano: { icon: 'ih-piano', tile: 'lilac' },
  dance: { icon: 'ih-dance', tile: 'rose' },
  puzzle: { icon: 'ih-puzzle', tile: 'mint' },
  roleplay: { icon: 'ih-roleplay', tile: 'peach' },
  movie: { icon: 'ih-movie', tile: 'sky' },
  exercise: { icon: 'ih-exercise', tile: 'mint' },
  swim: { icon: 'ih-swim', tile: 'aqua' },
  bike: { icon: 'ih-bike', tile: 'sky' },
  outside: { icon: 'ih-outside', tile: 'mint' },
  meal: { icon: 'ih-meal', tile: 'rose' },
  snack: { icon: 'ih-snack', tile: 'cream' },
  nap: { icon: 'ih-nap', tile: 'aqua' },
  rest: { icon: 'ih-rest', tile: 'lilac' },
  friend: { icon: 'ih-friend', tile: 'peach' },
  pets: { icon: 'ih-pets', tile: 'cream' },
  garden: { icon: 'ih-garden', tile: 'lemon' },
  travel: { icon: 'ih-travel', tile: 'sky' },
  computer: { icon: 'ih-computer', tile: 'aqua' },
  camera: { icon: 'ih-camera', tile: 'rose' },
  lightbulb: { icon: 'ih-lightbulb', tile: 'lemon' },
};

/** UI glyphs that are not activity presets. `fallback` is ih-pin on lilac. */
export const UiGlyphs = {
  progressToday: { emoji: '⭐', icon: 'ih-star', tile: 'lemon' },
  progressPast: { emoji: '📊', icon: 'ih-chart', tile: 'sky' },
  celebration: { emoji: '🎉', icon: 'ih-party', tile: 'rose' },
  encouragement: { emoji: '💪', icon: 'ih-cheer', tile: 'peach' },
  overlap: { emoji: '⚠️', icon: 'ih-warn', tile: 'amber' },
  planHint: { emoji: '✨', icon: 'ih-sparkle', tile: 'lemon' },
  fallback: { emoji: '📌', icon: 'ih-pin', tile: 'lilac' },
  complete: { emoji: '✓', icon: 'ih-check', tile: 'mint' },
  dismiss: { emoji: '✕', icon: 'ih-close', tile: 'rose' },
} as const;

export type UiGlyphId = keyof typeof UiGlyphs;

export const FALLBACK_ACTIVITY_ICON = UiGlyphs.fallback.icon;

export type ResolvedActivityIcon = {
  /** `ih-*` icon name. Always set. */
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
 * Map a stored activity value to an ih-* icon.
 * Accepts a preset key (`homework`) or the emoji that key used to display (`📝`).
 * Null, blank, and anything we do not know become ih-pin on lilac.
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
