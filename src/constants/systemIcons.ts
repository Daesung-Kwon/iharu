/**
 * Tab and settings-row ih-* names. Activity presets live in activityIcons.ts.
 */

import type { IhIconName } from '../components/icons/ihIconPaths';

export const TabIcons = {
  today: { outline: 'ih-today', fill: 'ih-today-fill' },
  plan: { outline: 'ih-plan', fill: 'ih-plan-fill' },
  activity: { outline: 'ih-activity', fill: 'ih-activity-fill' },
  settings: { outline: 'ih-settings', fill: 'ih-settings-fill' },
} as const satisfies Record<string, { outline: IhIconName; fill: IhIconName }>;

export type TabIconId = keyof typeof TabIcons;

/** The 14 settings-row glyphs on ProfileScreen, in mapping.tsv order. */
export const SETTINGS_ROW_ICONS = [
  'ih-notification',
  'ih-lock',
  'ih-lock-open',
  'ih-gift',
  'ih-verified',
  'ih-add-circle',
  'ih-document',
  'ih-privacy',
  'ih-code',
  'ih-info',
  'ih-backup',
  'ih-restore',
  'ih-delete',
  'ih-chevron',
] as const satisfies readonly IhIconName[];
