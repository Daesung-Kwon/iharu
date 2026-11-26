/**
 * Overdue schedule card. The card itself stays the normal activity card.
 * Only a small amber tag says the time has passed.
 */

import { LateStatus, SoftPopColors } from '../constants/theme';

export const OVERDUE_TAG = '시간 지남';

const PUNISHING = [
  SoftPopColors.error,
  SoftPopColors.primary,
  '#FFF0F0',
  '#FF6B6B',
  '#D6393E',
  '#F0565A',
] as const;

export function overdueScheduleAppearance(normalSurface: string) {
  const surface = normalSurface || SoftPopColors.white;
  return {
    card: {
      backgroundColor: surface,
      borderColor: SoftPopColors.white,
    },
    tag: {
      text: OVERDUE_TAG,
      textColor: LateStatus.text,
      iconColor: LateStatus.icon,
      backgroundColor: LateStatus.soft,
    },
  };
}

export function isPunishingStatusColor(color: string): boolean {
  return PUNISHING.some(banned => banned.toLowerCase() === color.toLowerCase());
}
