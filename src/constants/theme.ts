/**
 * Soft Pop 3D (Claymorphism) palette shared across screens and components.
 *
 * Role colors so a child can read status without reading labels:
 * today = orange, now = teal, complete = green, partial = soft blue,
 * alert/primary = coral.
 */
export const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red — alerts, progress, large surfaces. Not the tab pill.
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
  success: '#6BCB77',
  error: '#FF6B6B',
  link: '#2196F3',
  today: '#FF9800',
  todaySurface: '#FFF3E0',
  now: '#2EC4B6',
  nowSurface: '#E6FAF8',
  complete: '#6BCB77',
  completeSurface: '#F0FFF4',
  // Partly done day (WeekStrip dot). Must not reuse today's orange, or a
  // child reads "partly done" as "today".
  partial: '#5B8DEF',
};

/**
 * Overdue ("시간 지남"). The card stays a normal card. Only a small amber
 * tag uses these. Text is 4.67:1 on `soft` (brand guide: 4.7:1).
 * Coral and red are not used here.
 */
export const LateStatus = {
  text: '#A35C22',
  icon: '#B86A26',
  soft: '#FFF3E3',
} as const;

/**
 * Coral roles locked 11/23. `primary` stays the large-surface coral.
 * The tab pill and the celebration button use these instead.
 */
export const BrandAccent = {
  /** White-label fill buttons (15pt+ bold). */
  strong: '#F0565A',
  /** Coral type and the active tab icon. */
  text: '#D6393E',
  /** Selected chip and the active tab pill. */
  soft: '#FFEDEA',
} as const;

/**
 * Floating tab bar. The bar stays a translucent white clay. The selected
 * tab is a soft pill (`accentSoft`) with a filled ih-* icon and label in
 * `accentText`. Inactive tabs are outline icons and labels in ink2.
 * The solid #FF6B6B pill is retired: that coral is 2.45:1 on the soft pill.
 */
export const TabBarColors = {
  bar: 'rgba(255, 255, 255, 0.75)',
  activePill: BrandAccent.soft,
  activeIcon: BrandAccent.text,
  activeLabel: BrandAccent.text,
  inactive: SoftPopColors.textSecondary,
} as const;

/**
 * One chrome for the bottom sheets (보상 약속, 보상 확장, Plan +추가).
 * Radius, scrim, and content inset live here so those sheets cannot drift.
 * The bottom inset is getSheetBottomPadding (max(safe area, 16) + 16), not a
 * second number in this object. The scrim is one even dim (ModalBackdrop);
 * sheets do not each invent a blur.
 */
export const SheetChrome = {
  radius: 32,
  backdrop: 'rgba(0, 0, 0, 0.5)',
  paddingHorizontal: 20,
  paddingTop: 20,
} as const;
