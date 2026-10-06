/**
 * Pure layout tokens so phone vs tablet math can be tested without RN.
 */

import { BREAKPOINTS } from '../constants/config';

export const TAB_BAR_HEIGHT = 68;
/** Shorter floating tab bar for SE-class phones (667pt tall). */
export const TAB_BAR_HEIGHT_SMALL = 60;
/**
 * Phones whose long side is below this are "phoneSmall" (iPhone SE 2/3: 667pt).
 * Long side, not current height, so SE landscape stays in the same tier.
 */
export const SMALL_PHONE_MAX_LONG_SIDE = 700;
export const AD_BANNER_HEIGHT = 60;
/** Gap between the toast and whatever bottom chrome (ad / tab bar) is showing. */
export const TOAST_CHROME_GAP = 12;
export const ACTIVITY_CARD_MIN_WIDTH = 140;
/** Apple HIG minimum touch target (pt). */
export const MIN_TOUCH_TARGET = 44;

/**
 * - phoneSmall: SE 2/3 (375x667) — tightest tokens, single-row header.
 * - phoneRegular: mini / standard / Pro Max phones (375x812, 402x874, ...).
 * - tablet: iPad (short side >= 768).
 */
export type LayoutTier = 'phoneSmall' | 'phoneRegular' | 'tablet';

export function getLayoutTier(width: number, height: number): LayoutTier {
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  if (shortSide >= BREAKPOINTS.tablet) return 'tablet';
  if (longSide < SMALL_PHONE_MAX_LONG_SIDE) return 'phoneSmall';
  return 'phoneRegular';
}

type TierTokens = {
  space: number;
  titleSize: number;
  cardPad: number;
  cardRadius: number;
  tabBarHeight: number;
  dateCardWidth: number;
};

const TIER_TOKENS: Record<LayoutTier, TierTokens> = {
  phoneSmall: {
    space: 12,
    titleSize: 20,
    cardPad: 12,
    cardRadius: 16,
    tabBarHeight: TAB_BAR_HEIGHT_SMALL,
    dateCardWidth: 64,
  },
  phoneRegular: {
    space: 16,
    titleSize: 22,
    cardPad: 14,
    cardRadius: 18,
    tabBarHeight: TAB_BAR_HEIGHT,
    dateCardWidth: 64,
  },
  tablet: {
    space: 32,
    titleSize: 28,
    cardPad: 24,
    cardRadius: 24,
    tabBarHeight: TAB_BAR_HEIGHT,
    dateCardWidth: 80,
  },
};

export type LayoutMetrics = {
  width: number;
  height: number;
  tier: LayoutTier;
  /** Any phone (phoneSmall or phoneRegular). */
  isPhone: boolean;
  /** SE-class phone: compress chrome so the current activity fits above the fold. */
  isSmallPhone: boolean;
  /**
   * Phones show one date UI (WeekStrip with day numbers + week arrows);
   * tablets keep the horizontal date picker plus the week summary.
   */
  showDatePicker: boolean;
  isCompact: boolean;
  isLandscape: boolean;
  space: number;
  titleSize: number;
  activityColumns: number;
  tabBarHeight: number;
  dateCardWidth: number;
  cardPad: number;
  cardRadius: number;
};

/** Clay card shadow: one step quieter on phone so lists scroll shorter. */
export function getClayShadow(isCompact: boolean) {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isCompact ? 2 : 4 },
    shadowOpacity: isCompact ? 0.08 : 0.15,
    shadowRadius: isCompact ? 4 : 8,
    elevation: isCompact ? 3 : 5,
  } as const;
}

export type TabBarChrome = {
  /** Height of the (transparent) tab bar container. */
  barHeight: number;
  /** paddingBottom of the tab bar so items center inside the pill. */
  paddingBottom: number;
  /** Gap between the white pill and the screen bottom. */
  pillMarginBottom: number;
  pillMarginHorizontal: number;
  /** Min height of each tab button (always >= 44pt). */
  buttonMinHeight: number;
  /** Total height the floating tab bar occupies from the screen bottom. */
  offset: number;
};

/**
 * Floating tab bar geometry per tier and safe-area inset.
 *
 * iOS home-button phones (inset 0, e.g. SE) use an 8pt floor instead of the
 * old 10/12pt so the pill sits closer to the edge; notched phones and iPad
 * keep their previous geometry. Android is unchanged apart from tier height.
 */
export function getTabBarChrome(
  tier: LayoutTier,
  insetsBottom: number,
  os: 'ios' | 'android' | string,
): TabBarChrome {
  const height = TIER_TOKENS[tier].tabBarHeight;
  const inset = Math.max(0, insetsBottom);
  const pillMarginHorizontal = tier === 'tablet' ? 16 : 8;
  const buttonMinHeight = tier === 'phoneSmall' ? 48 : 56;

  if (os === 'android') {
    return {
      barHeight: height + inset,
      paddingBottom: Math.max(inset, 16),
      pillMarginBottom: Math.max(inset, 16),
      pillMarginHorizontal,
      buttonMinHeight,
      offset: height + Math.max(inset, 16) + 8,
    };
  }

  if (inset === 0) {
    const floor = 8;
    return {
      barHeight: height,
      paddingBottom: floor,
      pillMarginBottom: floor,
      pillMarginHorizontal,
      buttonMinHeight,
      offset: height + floor,
    };
  }

  return {
    barHeight: height + Math.max(inset - 8, 0),
    paddingBottom: Math.max(inset, 10),
    pillMarginBottom: Math.max(inset, 12),
    pillMarginHorizontal,
    buttonMinHeight,
    offset: height + Math.max(inset, 10),
  };
}

/**
 * Height the floating tab bar occupies from the screen bottom (iOS / Android).
 * Pure so it can be tested; useLayout passes Platform.OS and the tier.
 */
export function computeTabBarOffset(
  insetsBottom: number,
  os: 'ios' | 'android' | string,
  tier: LayoutTier = 'phoneRegular',
): number {
  return getTabBarChrome(tier, insetsBottom, os).offset;
}

/**
 * Bottom layout for screens that put the ad banner in normal flow (between
 * the ScrollView and a tab-bar spacer) instead of floating it over content.
 * The ScrollView viewport then ends above ad + tab bar, so the ad never covers
 * content; the banner reserves space only after it has actually loaded
 * (adHeight 0 until then).
 */
export function getInFlowBottomLayout({
  tabBarOffset,
  adHeight,
  isCompact,
  safeAreaBottomApplied = 0,
}: {
  tabBarOffset: number;
  adHeight: number;
  isCompact: boolean;
  /** Bottom inset the screen's SafeAreaView already pads (Android edge). */
  safeAreaBottomApplied?: number;
}) {
  const safeAd = Math.max(0, adHeight);
  return {
    /** paddingBottom inside the ScrollView: only breathing room. */
    scrollEndGap: isCompact ? 12 : 20,
    /** Spacer under the in-flow ad so it sits right above the floating tab bar. */
    tabBarSpacer: Math.max(0, tabBarOffset - Math.max(0, safeAreaBottomApplied)),
    /** Total bottom area not available to the ScrollView viewport. */
    reservedBottom: tabBarOffset + safeAd,
    /** Toast bottom so it floats above the ad (and its 취소 never overlaps it). */
    toastBottom: tabBarOffset + safeAd + TOAST_CHROME_GAP,
  };
}

function getActivityGridGap(isCompact: boolean): number {
  return isCompact ? 12 : 20;
}

/** Cap the 2/3/4/6 target so 140px cards do not wrap to a different count. */
export function getFittedActivityColumns(
  width: number,
  isCompact: boolean,
  isLandscape: boolean,
  space: number,
): number {
  const target = isCompact
    ? (isLandscape ? 3 : 2)
    : (isLandscape ? 6 : 4);
  const gap = getActivityGridGap(isCompact);
  const available = width - space * 2;
  const maxFit = Math.floor(
    (available + gap) / (ACTIVITY_CARD_MIN_WIDTH + gap),
  );
  return Math.max(1, Math.min(target, maxFit));
}

export function getLayoutMetrics(width: number, height: number): LayoutMetrics {
  // Shortest side: phone landscape (844×390) stays compact; iPad 768×1024 stays regular.
  const isCompact = Math.min(width, height) < BREAKPOINTS.tablet;
  const isLandscape = width > height;
  const tier = getLayoutTier(width, height);
  const tokens = TIER_TOKENS[tier];
  const isPhone = tier !== 'tablet';

  return {
    width,
    height,
    tier,
    isPhone,
    isSmallPhone: tier === 'phoneSmall',
    showDatePicker: !isPhone,
    isCompact,
    isLandscape,
    space: tokens.space,
    titleSize: tokens.titleSize,
    activityColumns: getFittedActivityColumns(
      width,
      isCompact,
      isLandscape,
      tokens.space,
    ),
    tabBarHeight: tokens.tabBarHeight,
    dateCardWidth: tokens.dateCardWidth,
    cardPad: tokens.cardPad,
    cardRadius: tokens.cardRadius,
  };
}
