import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTabBarOffset,
  getClayShadow,
  getInFlowBottomLayout,
  getLayoutMetrics,
  getLayoutTier,
  getTabBarChrome,
  TAB_BAR_HEIGHT,
  TAB_BAR_HEIGHT_SMALL,
  TOAST_CHROME_GAP,
} from './layoutMetrics';
import { BREAKPOINTS } from '../constants/config';

describe('getLayoutTier', () => {
  it('iPhone SE 375x667 is phoneSmall (portrait and landscape)', () => {
    assert.equal(getLayoutTier(375, 667), 'phoneSmall');
    assert.equal(getLayoutTier(667, 375), 'phoneSmall');
  });

  it('iPhone 13 mini 375x812 is phoneRegular despite SE width', () => {
    assert.equal(getLayoutTier(375, 812), 'phoneRegular');
  });

  it('iPhone 17 402x874 and its landscape are phoneRegular', () => {
    assert.equal(getLayoutTier(402, 874), 'phoneRegular');
    assert.equal(getLayoutTier(874, 402), 'phoneRegular');
  });

  it('iPad Air 11 820x1180 is tablet in both orientations', () => {
    assert.equal(getLayoutTier(820, 1180), 'tablet');
    assert.equal(getLayoutTier(1180, 820), 'tablet');
  });

  it('uses the 768 short-side breakpoint for tablets', () => {
    assert.equal(getLayoutTier(767, 1024), 'phoneRegular');
    assert.equal(getLayoutTier(BREAKPOINTS.tablet, 1024), 'tablet');
  });
});

describe('getLayoutMetrics', () => {
  it('iPhone SE 375x667: tightest tokens, two activity columns, single date UI', () => {
    const layout = getLayoutMetrics(375, 667);
    assert.equal(layout.tier, 'phoneSmall');
    assert.equal(layout.isPhone, true);
    assert.equal(layout.isSmallPhone, true);
    assert.equal(layout.showDatePicker, false);
    assert.equal(layout.isCompact, true);
    assert.equal(layout.isLandscape, false);
    assert.equal(layout.space, 12);
    assert.equal(layout.titleSize, 20);
    assert.equal(layout.cardPad, 12);
    assert.equal(layout.cardRadius, 16);
    assert.equal(layout.tabBarHeight, TAB_BAR_HEIGHT_SMALL);
    assert.equal(layout.activityColumns, 2);
  });

  it('iPhone 13 mini 375x812 keeps regular phone tokens', () => {
    const layout = getLayoutMetrics(375, 812);
    assert.equal(layout.tier, 'phoneRegular');
    assert.equal(layout.isSmallPhone, false);
    assert.equal(layout.showDatePicker, false);
    assert.equal(layout.space, 16);
    assert.equal(layout.titleSize, 22);
    assert.equal(layout.cardPad, 14);
    assert.equal(layout.cardRadius, 18);
    assert.equal(layout.tabBarHeight, TAB_BAR_HEIGHT);
    assert.equal(layout.dateCardWidth, 64);
    assert.equal(layout.activityColumns, 2);
  });

  it('iPhone 17 402x874 matches mini tokens', () => {
    const layout = getLayoutMetrics(402, 874);
    assert.equal(layout.tier, 'phoneRegular');
    assert.equal(layout.space, 16);
    assert.equal(layout.titleSize, 22);
    assert.equal(layout.activityColumns, 2);
  });

  it('iPad Air 11 820x1180 keeps tablet tokens and the date picker', () => {
    const layout = getLayoutMetrics(820, 1180);
    assert.equal(layout.tier, 'tablet');
    assert.equal(layout.isPhone, false);
    assert.equal(layout.showDatePicker, true);
    assert.equal(layout.isCompact, false);
    assert.equal(layout.space, 32);
    assert.equal(layout.titleSize, 28);
    assert.equal(layout.cardPad, 24);
    assert.equal(layout.cardRadius, 24);
    assert.equal(layout.dateCardWidth, 80);
    assert.equal(layout.tabBarHeight, TAB_BAR_HEIGHT);
    assert.equal(layout.activityColumns, 4);
  });

  it('iPad Air 11 landscape 1180x820 uses six activity columns', () => {
    const layout = getLayoutMetrics(1180, 820);
    assert.equal(layout.tier, 'tablet');
    assert.equal(layout.isLandscape, true);
    assert.equal(layout.activityColumns, 6);
  });

  it('SE landscape 667x375 stays phoneSmall with three columns', () => {
    const layout = getLayoutMetrics(667, 375);
    assert.equal(layout.tier, 'phoneSmall');
    assert.equal(layout.isLandscape, true);
    assert.equal(layout.activityColumns, 3);
  });

  it('keeps tablet portrait (768x1024) on the regular breakpoint', () => {
    const layout = getLayoutMetrics(BREAKPOINTS.tablet, 1024);
    assert.equal(layout.isCompact, false);
    assert.equal(layout.space, 32);
    assert.equal(layout.activityColumns, 4);
  });

  it('uses six activity columns on regular landscape', () => {
    const layout = getLayoutMetrics(1024, 768);
    assert.equal(layout.isCompact, false);
    assert.equal(layout.isLandscape, true);
    assert.equal(layout.activityColumns, 6);
  });

  it('treats 767 as compact and 769 as regular', () => {
    const compact = getLayoutMetrics(767, 1024);
    const regular = getLayoutMetrics(769, 1024);
    assert.equal(compact.isCompact, true);
    assert.equal(compact.activityColumns, 2);
    assert.equal(regular.isCompact, false);
    assert.equal(regular.activityColumns, 4);
  });

  it('keeps phone landscape compact so 844x390 stays phone', () => {
    const layout = getLayoutMetrics(844, 390);
    assert.equal(layout.isCompact, true);
    assert.equal(layout.tier, 'phoneRegular');
    assert.equal(layout.isLandscape, true);
    assert.equal(layout.space, 16);
    assert.equal(layout.activityColumns, 3);
  });

  it('does not claim six columns when 140px cards cannot fit', () => {
    const layout = getLayoutMetrics(800, 768);
    assert.equal(layout.isCompact, false);
    assert.equal(layout.isLandscape, true);
    assert.equal(layout.activityColumns, 4);
  });

  it('uses a quieter clay shadow on compact layouts', () => {
    const compact = getClayShadow(true);
    const regular = getClayShadow(false);
    assert.equal(compact.shadowOpacity, 0.08);
    assert.equal(compact.elevation, 3);
    assert.equal(regular.shadowOpacity, 0.15);
    assert.equal(regular.elevation, 5);
  });
});

describe('getTabBarChrome', () => {
  it('SE (home button, inset 0): 60pt bar, 8pt floor, 48pt buttons', () => {
    const chrome = getTabBarChrome('phoneSmall', 0, 'ios');
    assert.equal(chrome.barHeight, TAB_BAR_HEIGHT_SMALL);
    assert.equal(chrome.paddingBottom, 8);
    assert.equal(chrome.pillMarginBottom, 8);
    assert.equal(chrome.pillMarginHorizontal, 8);
    assert.equal(chrome.buttonMinHeight, 48);
    assert.equal(chrome.offset, TAB_BAR_HEIGHT_SMALL + 8);
    // Items sit in the same band as the pill.
    assert.equal(chrome.barHeight - chrome.paddingBottom, chrome.barHeight - chrome.pillMarginBottom);
    assert.ok(chrome.buttonMinHeight >= 44);
    assert.ok(chrome.buttonMinHeight <= chrome.barHeight - chrome.paddingBottom);
  });

  it('regular home-button iPhone (e.g. 8 Plus) also uses the 8pt floor', () => {
    const chrome = getTabBarChrome('phoneRegular', 0, 'ios');
    assert.equal(chrome.barHeight, TAB_BAR_HEIGHT);
    assert.equal(chrome.offset, TAB_BAR_HEIGHT + 8);
  });

  it('notched phones (mini / 17) keep the previous geometry', () => {
    const chrome = getTabBarChrome('phoneRegular', 34, 'ios');
    assert.equal(chrome.barHeight, TAB_BAR_HEIGHT + 26);
    assert.equal(chrome.paddingBottom, 34);
    assert.equal(chrome.pillMarginBottom, 34);
    assert.equal(chrome.buttonMinHeight, 56);
    assert.equal(chrome.offset, TAB_BAR_HEIGHT + 34);
  });

  it('iPad keeps wider pill margins and its home-indicator inset', () => {
    const chrome = getTabBarChrome('tablet', 20, 'ios');
    assert.equal(chrome.pillMarginHorizontal, 16);
    assert.equal(chrome.offset, TAB_BAR_HEIGHT + 20);
  });

  it('Android keeps its 16pt floor plus 8', () => {
    assert.equal(getTabBarChrome('phoneRegular', 0, 'android').offset, TAB_BAR_HEIGHT + 16 + 8);
    assert.equal(getTabBarChrome('phoneSmall', 0, 'android').offset, TAB_BAR_HEIGHT_SMALL + 16 + 8);
  });

  it('computeTabBarOffset delegates to the chrome (default tier phoneRegular)', () => {
    assert.equal(computeTabBarOffset(34, 'ios'), TAB_BAR_HEIGHT + 34);
    assert.equal(computeTabBarOffset(0, 'ios', 'phoneSmall'), TAB_BAR_HEIGHT_SMALL + 8);
  });
});

describe('getInFlowBottomLayout (ad must not cover content)', () => {
  it('iPhone SE 375x667 with a loaded 58pt adaptive banner', () => {
    const { isCompact, tier } = getLayoutMetrics(375, 667);
    const tabBarOffset = computeTabBarOffset(0, 'ios', tier);
    const layout = getInFlowBottomLayout({ tabBarOffset, adHeight: 58, isCompact });
    assert.equal(layout.scrollEndGap, 12);
    assert.equal(layout.tabBarSpacer, tabBarOffset);
    assert.equal(layout.reservedBottom, tabBarOffset + 58);
    assert.equal(layout.toastBottom, tabBarOffset + 58 + TOAST_CHROME_GAP);
    // SE status bar is 20pt; phoneSmall chrome leaves > 500pt of viewport.
    const viewport = 667 - 20 - layout.reservedBottom;
    assert.ok(viewport > 500, `viewport ${viewport}`);
  });

  it('reserves no ad space until the banner has loaded', () => {
    const tabBarOffset = computeTabBarOffset(0, 'ios', 'phoneSmall');
    const layout = getInFlowBottomLayout({ tabBarOffset, adHeight: 0, isCompact: true });
    assert.equal(layout.reservedBottom, tabBarOffset);
    assert.equal(layout.toastBottom, tabBarOffset + TOAST_CHROME_GAP);
  });

  it('does not double-count a bottom inset the SafeAreaView already pads (Android)', () => {
    const tabBarOffset = computeTabBarOffset(24, 'android');
    const layout = getInFlowBottomLayout({
      tabBarOffset,
      adHeight: 50,
      isCompact: true,
      safeAreaBottomApplied: 24,
    });
    assert.equal(layout.tabBarSpacer, tabBarOffset - 24);
    assert.equal(layout.reservedBottom, tabBarOffset + 50);
  });

  it('treats a negative/garbage ad height as zero', () => {
    const layout = getInFlowBottomLayout({ tabBarOffset: 78, adHeight: -5, isCompact: true });
    assert.equal(layout.reservedBottom, 78);
  });

  it('iPad uses the regular scroll gap and its taller banner height', () => {
    const { isCompact, tier } = getLayoutMetrics(820, 1180);
    const tabBarOffset = computeTabBarOffset(20, 'ios', tier);
    const layout = getInFlowBottomLayout({ tabBarOffset, adHeight: 90, isCompact });
    assert.equal(isCompact, false);
    assert.equal(layout.scrollEndGap, 20);
    assert.equal(layout.reservedBottom, tabBarOffset + 90);
  });
});
