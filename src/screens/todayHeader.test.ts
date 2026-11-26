import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BrandAccent, SoftPopColors } from '../constants/theme';
import { Fonts } from '../constants/fonts';
import { Spacing, Typography } from '../constants/materialDesign';
import { compactTitleIsPrimary, compactTitleOpacity, LARGE_TITLE_SCALE_END } from '../hooks/collapsingHeader';
import { getLayoutMetrics, getTabBarChrome, MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';
import { getBottomChrome, getScrollEndPadding, SCROLL_END_GAP } from '../utils/safeArea';
import {
  TODAY_ACCESSORY_FADE_AT,
  TODAY_BUTTON_ICON,
  TODAY_COMPACT_TITLE,
  TODAY_HISTORY_TITLE,
  TODAY_LARGE_TITLE,
  TODAY_SCROLLS_AWAY,
  TODAY_STICKY,
  horizontalDatePickerHeight,
  promiseBlock,
  todayAccessoryFaded,
  todayAccessoryOpacity,
  todayCollapseDistance,
  todayCollapsingMetrics,
  todayCompactTitle,
  todayCompletionColor,
  todayCompletionLabel,
  todayHeaderContentGap,
  todayHeaderPresentation,
  todayLargeTitle,
  todayListPadding,
  todayRestingContentTop,
  todayScrollContentMinHeight,
  todayShowsCompletion,
  weekStripBlock,
  type TodayHeaderInput,
} from './todayHeader';

const root = join(__dirname, '..', '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

const DEVICES = [
  { label: 'iPhone SE', width: 375, height: 667, os: 'ios' as const, inset: 0 },
  { label: 'iPhone Pro', width: 402, height: 874, os: 'ios' as const, inset: 34 },
  { label: 'iPad', width: 820, height: 1180, os: 'ios' as const, inset: 20 },
  { label: 'Android phone', width: 360, height: 640, os: 'android' as const, inset: 24 },
];

function inputFor(
  width: number,
  height: number,
  overrides: Partial<TodayHeaderInput> = {},
): TodayHeaderInput {
  const layout = getLayoutMetrics(width, height);
  return {
    isPhone: layout.isPhone,
    isSmallPhone: layout.isSmallPhone,
    isCompact: layout.isCompact,
    space: layout.space,
    cardPad: layout.cardPad,
    cardRadius: layout.cardRadius,
    titleSize: layout.titleSize,
    showPromise: false,
    showDatePicker: layout.showDatePicker,
    showPastBadge: false,
    showTodayButton: false,
    ...overrides,
  };
}

/** The pre-collapse phone/tablet stack, written out so it cannot drift with the helper. */
function legacyExpanded(input: TodayHeaderInput): number {
  const paddingTop = input.isPhone ? input.cardPad : input.space;
  const paddingBottom = input.isPhone
    ? (input.isSmallPhone ? 14 : 10)
    : (input.isCompact ? 12 : 20);
  const line = input.titleSize + 8;
  const title = input.isPhone
    ? (input.showTodayButton ? Math.max(line, 44) : line)
    : (input.showTodayButton ? Math.max(line + 8 + 24, 56) : line + 8 + 24);
  const past = input.showPastBadge ? 12 + 12 + 16 : 0;
  const picker = input.showDatePicker ? 20 + horizontalDatePickerHeight() : 0;
  const week = weekStripBlock(input.isPhone, input.isSmallPhone);
  const promise = input.showPromise ? promiseBlock(input.isSmallPhone) : 0;
  return paddingTop + title + past + picker + week + promise + paddingBottom + 4;
}

describe('today header stack stays the height it is now', () => {
  it('iPhone SE expanded card matches the current title + week + promise stack', () => {
    const viewingToday = inputFor(375, 667, { showPromise: true });
    const metrics = todayCollapsingMetrics(viewingToday);
    const legacy = 12 + (20 + 8) + (6 + 44 + 4 + 52) + (12 + 24 + 20 + 18) + 14 + 4;
    assert.equal(legacy, 238);
    assert.equal(metrics.expandedHeight, legacy);
    assert.equal(metrics.expandedHeight, legacyExpanded(viewingToday));
    assert.ok(metrics.expandedHeight <= legacy);
    assert.equal(metrics.compactHeight, 4 + MIN_TOUCH_TARGET + 4 + 4);
    assert.equal(metrics.compactHeight, 56);
    assert.ok(metrics.expandedHeight > metrics.compactHeight);
    const inner = metrics.compactHeight - metrics.compactPaddingVertical * 2 - metrics.borderWidth * 2;
    assert.equal(inner, MIN_TOUCH_TARGET);
  });

  it('does not move the first section down on SE, with or without the weekly promise', () => {
    for (const showPromise of [false, true]) {
      const input = inputFor(375, 667, { showPromise });
      const metrics = todayCollapsingMetrics(input);
      const legacy = legacyExpanded(input);
      assert.equal(metrics.expandedHeight, legacy);
      const top = todayRestingContentTop(input.space, metrics.expandedHeight, metrics.listGap);
      assert.equal(top, input.space + legacy + input.space);
      assert.equal(metrics.listGap, 12);
    }
    const withPromise = todayCollapsingMetrics(inputFor(375, 667, { showPromise: true }));
    const without = todayCollapsingMetrics(inputFor(375, 667, { showPromise: false }));
    assert.equal(withPromise.expandedHeight - without.expandedHeight, promiseBlock(true));
  });

  it('keeps the 오늘 button inside the old row instead of adding one', () => {
    const input = inputFor(375, 667, { showPromise: true, showTodayButton: true });
    const metrics = todayCollapsingMetrics(input);
    const legacy = legacyExpanded(input);
    assert.equal(metrics.expandedHeight, legacy);
    assert.equal(metrics.titleBlockHeight, 44);
    assert.equal(metrics.expandedHeight - todayCollapsingMetrics(inputFor(375, 667, { showPromise: true })).expandedHeight, 16);
  });

  it('matches the current stack on Pro, iPad, and Android', () => {
    for (const device of DEVICES) {
      for (const showPromise of [false, true]) {
        const input = inputFor(device.width, device.height, {
          showPromise,
          showPastBadge: !inputFor(device.width, device.height).isPhone,
          showTodayButton: true,
        });
        const metrics = todayCollapsingMetrics(input);
        assert.equal(metrics.expandedHeight, legacyExpanded(input), device.label);
        assert.ok(metrics.compactHeight >= MIN_TOUCH_TARGET, device.label);
        assert.ok(metrics.expandedHeight > metrics.compactHeight, device.label);
      }
    }
  });

  it('sizes the iPad date picker from the picker padding and type, not a second header', () => {
    assert.equal(Spacing.md, 16);
    assert.equal(Spacing.xs, 4);
    assert.equal(Typography.caption.lineHeight, 16);
    assert.equal(Typography.h5.lineHeight, 24);
    const card = 2 * 2 + 16 * 2 + 16 + 4 + 24;
    assert.equal(horizontalDatePickerHeight(), 16 * 2 + card);
    assert.equal(horizontalDatePickerHeight(), 112);
    const tablet = todayCollapsingMetrics(inputFor(820, 1180, { showPromise: false }));
    assert.equal(tablet.accessoryHeight, 20 + 112 + weekStripBlock(false, false));
  });
});

describe('today collapse does not overlap or jump', () => {
  it('holds the gap under the bar while it shrinks, then lets the list pass behind it', () => {
    for (const device of DEVICES) {
      const input = inputFor(device.width, device.height, { showPromise: true });
      const metrics = todayCollapsingMetrics(input);
      const distance = todayCollapseDistance(metrics.expandedHeight, metrics.compactHeight);
      for (const reduceMotion of [false, true]) {
        for (const y of [0, distance / 2, distance]) {
          assert.equal(todayHeaderContentGap({
            scrollY: y,
            space: input.space,
            expandedHeight: metrics.expandedHeight,
            compactHeight: metrics.compactHeight,
            listGap: metrics.listGap,
            reduceMotion,
          }), metrics.listGap, `${device.label} reduce=${reduceMotion} @ ${y}`);
        }
      }
      const behind = todayHeaderContentGap({
        scrollY: distance + metrics.listGap + 8,
        space: input.space,
        expandedHeight: metrics.expandedHeight,
        compactHeight: metrics.compactHeight,
        listGap: metrics.listGap,
      });
      assert.ok(behind < 0, `${device.label} should scroll behind the bar`);
    }
  });

  it('never stretches on overscroll and never grows the card as scroll increases', () => {
    const metrics = todayCollapsingMetrics(inputFor(375, 667, { showPromise: true }));
    const distance = metrics.expandedHeight - metrics.compactHeight;
    let previous = metrics.expandedHeight;
    for (let y = -20; y <= distance + 30; y += 1) {
      const view = todayHeaderPresentation(y, {
        reduceMotion: false,
        expandedHeight: metrics.expandedHeight,
        compactHeight: metrics.compactHeight,
        accessoryHeight: metrics.accessoryHeight,
        titleSize: 20,
        isViewingToday: true,
        dateLabel: '11월 25일 (수)',
        totalItems: 3,
        completionRate: 40,
        showTodayButton: false,
      });
      assert.ok(view.height <= previous + 1e-6);
      assert.ok(view.height >= metrics.compactHeight - 1e-6);
      assert.ok(view.height <= metrics.expandedHeight + 1e-6);
      previous = view.height;
    }
    assert.equal(todayHeaderPresentation(-10, {
      reduceMotion: false,
      expandedHeight: metrics.expandedHeight,
      compactHeight: metrics.compactHeight,
      accessoryHeight: metrics.accessoryHeight,
      titleSize: 20,
      isViewingToday: true,
      dateLabel: '11월 25일 (수)',
      totalItems: 1,
      completionRate: 0,
      showTodayButton: false,
    }).height, metrics.expandedHeight);
  });

  it('passes the shared scroll-end padding through on SE, Pro, iPad, and Android', () => {
    for (const device of DEVICES) {
      const layout = getLayoutMetrics(device.width, device.height);
      const metrics = todayCollapsingMetrics(inputFor(device.width, device.height, { showPromise: true }));
      const chrome = getTabBarChrome(layout.tier, device.inset, device.os);
      const end = getScrollEndPadding(getBottomChrome(chrome.offset, 0));
      const padding = todayListPadding({
        space: layout.space,
        expandedHeight: metrics.expandedHeight,
        listGap: metrics.listGap,
        scrollEndPadding: end,
      });
      assert.equal(padding.paddingBottom, end, device.label);
      assert.equal(padding.paddingBottom, chrome.offset + SCROLL_END_GAP, device.label);
      assert.equal(padding.paddingHorizontal, layout.space);
      assert.equal(padding.paddingTop, layout.space + metrics.expandedHeight + metrics.listGap);
    }
  });

  it('gives a short list enough travel to finish the collapse without moving the first section', () => {
    const metrics = todayCollapsingMetrics(inputFor(375, 667, { showPromise: true }));
    const distance = todayCollapseDistance(metrics.expandedHeight, metrics.compactHeight);
    const viewport = 500;
    const minHeight = todayScrollContentMinHeight(viewport, distance);
    assert.equal(minHeight, viewport + distance);
    assert.ok(minHeight - viewport >= distance);
    const padding = todayListPadding({
      space: 12,
      expandedHeight: metrics.expandedHeight,
      listGap: metrics.listGap,
      scrollEndPadding: 84,
    });
    assert.equal(padding.paddingTop, todayRestingContentTop(12, metrics.expandedHeight, metrics.listGap));
    assert.equal(padding.paddingTop, 12 + metrics.expandedHeight + 12);
    assert.equal(todayScrollContentMinHeight(0, distance), distance);
    assert.equal(todayScrollContentMinHeight(Number.NaN, distance), distance);
    assert.equal(todayScrollContentMinHeight(viewport, 0), viewport);
    assert.equal(todayScrollContentMinHeight(-20, Number.NaN), 0);
  });
});

describe('today header render states', () => {
  const metrics = todayCollapsingMetrics(inputFor(375, 667, { showPromise: true }));
  const distance = metrics.expandedHeight - metrics.compactHeight;
  const base = {
    expandedHeight: metrics.expandedHeight,
    compactHeight: metrics.compactHeight,
    accessoryHeight: metrics.accessoryHeight,
    titleSize: 20,
    dateLabel: '11월 25일 (수)',
    totalItems: 4,
    completionRate: 72,
    showTodayButton: false,
  };

  it('renders the expanded large title and hides the sticky percent', () => {
    const view = todayHeaderPresentation(0, { ...base, reduceMotion: false, isViewingToday: true });
    assert.equal(view.largeTitle, TODAY_LARGE_TITLE);
    assert.equal(view.largeTitle, '오늘의 일정');
    assert.equal(view.compactTitle, TODAY_COMPACT_TITLE);
    assert.equal(view.compactTitle, '오늘');
    assert.equal(view.progress, 0);
    assert.equal(view.layoutProgress, 0);
    assert.equal(view.height, metrics.expandedHeight);
    assert.equal(view.accessoryHeight, metrics.accessoryHeight);
    assert.equal(view.largeOpacity, 1);
    assert.equal(view.largeScale, 1);
    assert.equal(view.compactOpacity, 0);
    assert.equal(view.accessoryOpacity, 1);
    assert.equal(view.completionOpacity, 0);
    assert.equal(view.completionLabel, '72%');
    assert.equal(view.completionColor, BrandAccent.text);
    assert.equal(view.largeHeaderRole, 'header');
    assert.equal(view.compactHeaderRole, 'header');
    assert.equal(view.largeHidden, false);
    assert.equal(view.compactHidden, true);
    assert.equal(view.completionHidden, true);
    assert.equal(view.accessoryInteractive, true);
    assert.equal(view.largeFontFamily, Fonts.jua);
    assert.equal(view.compactFontFamily, Fonts.jua);
    assert.equal(view.sticky, TODAY_STICKY);
    assert.equal(view.scrollsAway.weekStrip, true);
    assert.equal(view.scrollsAway.progressDetail, true);
    assert.equal(TODAY_SCROLLS_AWAY.weeklyPromise, true);
    assert.equal(view.todayButtonMinHeight, 44);
  });

  it('renders the compact short title and the sticky percent', () => {
    const view = todayHeaderPresentation(distance, {
      ...base,
      reduceMotion: false,
      isViewingToday: false,
      showTodayButton: true,
    });
    assert.equal(view.largeTitle, TODAY_HISTORY_TITLE);
    assert.equal(view.compactTitle, '11월 25일 (수)');
    assert.equal(todayCompactTitle(false, '11월 25일 (수)'), view.compactTitle);
    assert.equal(todayLargeTitle(false), '일정 이력');
    assert.equal(view.progress, 1);
    assert.equal(view.height, metrics.compactHeight);
    assert.equal(view.accessoryHeight, 0);
    assert.equal(view.largeOpacity, 0);
    assert.equal(view.compactOpacity, 1);
    assert.equal(view.accessoryOpacity, 0);
    assert.equal(view.largeScale, LARGE_TITLE_SCALE_END);
    assert.equal(view.completionOpacity, 1);
    assert.equal(view.completionHidden, false);
    assert.equal(view.largeHeaderRole, null);
    assert.equal(view.largeHidden, true);
    assert.equal(view.compactHidden, false);
    assert.equal(view.accessoryInteractive, false);
    assert.equal(view.showTodayButton, true);
    assert.equal(view.sticky.compactTitle, true);
    assert.equal(view.sticky.completion, true);
    assert.equal(view.sticky.todayButton, true);
  });

  it('drops the week strip before the compact title takes the header role', () => {
    let handedOff = false;
    for (let step = 0; step <= 100; step += 1) {
      const progress = step / 100;
      const accessory = todayAccessoryOpacity(progress);
      const compact = compactTitleOpacity(progress);
      if (accessory > 0.5) assert.equal(compact, 0, `titles overlap the strip at ${progress}`);
      if (compactTitleIsPrimary(progress)) {
        handedOff = true;
        assert.ok(accessory < 0.2, `strip still strong at ${progress}`);
        assert.equal(todayAccessoryFaded(progress), progress >= TODAY_ACCESSORY_FADE_AT);
      }
    }
    assert.equal(handedOff, true);
    assert.equal(TODAY_ACCESSORY_FADE_AT, 0.75);
    assert.equal(todayAccessoryFaded(0.74), false);
    assert.equal(todayAccessoryFaded(0.75), true);
  });

  it('hides the sticky percent when the day has no items, and turns 100% green', () => {
    const empty = todayHeaderPresentation(distance, {
      ...base,
      reduceMotion: false,
      isViewingToday: true,
      totalItems: 0,
      completionRate: 0,
    });
    assert.equal(todayShowsCompletion(0), false);
    assert.equal(empty.completionLabel, null);
    assert.equal(empty.completionOpacity, 0);
    assert.equal(empty.completionHidden, true);
    assert.equal(todayCompletionLabel(72.4), '72%');
    assert.equal(todayCompletionLabel(Number.NaN), '0%');
    assert.equal(todayCompletionColor(72), BrandAccent.text);
    assert.equal(todayCompletionColor(100), SoftPopColors.complete);
    assert.equal(todayCompletionColor(Number.NaN), BrandAccent.text);
  });

  it('Reduce Motion snaps the crossfade and still tracks height with the finger', () => {
    const before = todayHeaderPresentation(distance * 0.49, { ...base, reduceMotion: true, isViewingToday: true });
    const after = todayHeaderPresentation(distance * 0.5, { ...base, reduceMotion: true, isViewingToday: true });
    assert.equal(before.progress, 0);
    assert.equal(before.largeOpacity, 1);
    assert.equal(before.compactOpacity, 0);
    assert.equal(before.accessoryOpacity, 1);
    assert.equal(before.largeHeaderRole, 'header');
    assert.ok(before.layoutProgress > 0 && before.layoutProgress < 1);
    assert.ok(before.height < metrics.expandedHeight);
    assert.ok(before.height > metrics.compactHeight);
    assert.equal(after.progress, 1);
    assert.equal(after.largeOpacity, 0);
    assert.equal(after.compactOpacity, 1);
    assert.equal(after.accessoryOpacity, 0);
    assert.equal(after.compactHidden, false);
    assert.equal(after.completionHidden, false);
    assert.ok(Math.abs(after.layoutProgress - 0.5) < 1e-9);
    assert.ok(after.height < metrics.expandedHeight);
    assert.ok(after.height > metrics.compactHeight);
    const smooth = todayHeaderPresentation(distance * 0.5, { ...base, reduceMotion: false, isViewingToday: true });
    assert.equal(smooth.progress, 0.5);
    assert.equal(smooth.largeOpacity, 1);
    assert.equal(smooth.compactOpacity, 0);
  });
});

describe('today header wiring', () => {
  it('the screen reuses the collapsing hook without changing Activity', () => {
    const screen = read('src/screens/TodayScreen.tsx');
    const header = read('src/components/TodayCollapsingHeader.tsx');
    const hook = read('src/hooks/useCollapsingHeader.ts');
    const activity = read('src/screens/ActivitiesScreen.tsx');
    for (const token of [
      'useCollapsingHeader',
      'snapLayout: false',
      'TODAY_ACCESSORY_FADE_AT',
      'todayListPadding',
      'todayScrollContentMinHeight',
      'minHeight: contentMinHeight',
      'onScrollEndDrag={collapse.onScrollEndDrag}',
      'onMomentumScrollEnd={collapse.onMomentumScrollEnd}',
      'ref={collapse.scrollRef}',
      'scrollEndPadding',
      'contentInsetAdjustmentBehavior="never"',
      'TodayCollapsingHeader',
      'todayCompletionColor',
      'BrandAccent.text',
    ]) {
      assert.ok(screen.includes(token), token);
    }
    assert.equal(activity.includes('fadeAt'), false);
    assert.equal(activity.includes('snapLayout'), false);
    assert.ok(activity.includes('onScrollEndDrag={collapse.onScrollEndDrag}'));
    assert.ok(activity.includes('onMomentumScrollEnd={collapse.onMomentumScrollEnd}'));
    assert.ok(activity.includes('ref={collapse.scrollRef}'));
    assert.match(hook, /collapseSnapTarget/);
    assert.match(hook, /collapseSnapAnimated/);
    for (const token of [
      'stopRanges(LARGE_TITLE_OPACITY_STOPS)',
      'stopRanges(COMPACT_TITLE_OPACITY_STOPS)',
      'stopRanges(TODAY_ACCESSORY_OPACITY_STOPS)',
      'LARGE_TITLE_SCALE_END',
      'accessibilityRole="header"',
      'accessibilityElementsHidden',
      'today-header-today',
      'minHeight: MIN_TOUCH_TARGET',
      'TODAY_BUTTON_ICON',
      'BrandAccent.strong',
      '완료율',
    ]) {
      assert.ok(header.includes(token), token);
    }
    assert.equal(TODAY_BUTTON_ICON, 'ih-today');
    assert.match(hook, /useNativeDriver:\s*true/);
    assert.match(hook, /snapLayout/);
    assert.match(hook, /fadeAt/);
    assert.match(hook, /collapseProgress/);
    const nowElevation = Number(read('src/screens/TodayScreen.tsx').match(/currentActivityCard:[\s\S]*?elevation:\s*(\d+)/)?.[1]);
    const headerElevation = Number(header.match(/HEADER_ELEVATION = (\d+)/)?.[1]);
    assert.equal(nowElevation, 8);
    assert.ok(headerElevation > nowElevation);
  });

  it('locks the week strip and promise heights the stack is measured from', () => {
    const week = read('src/components/WeekStrip.tsx');
    const promise = read('src/components/WeeklyPromiseCard.tsx');
    assert.match(week, /containerFullDense:\s*\{[\s\S]*?marginTop:\s*6/);
    assert.match(week, /dayFullDense:\s*\{[\s\S]*?minHeight:\s*52/);
    assert.match(week, /dayFull:\s*\{[\s\S]*?minHeight:\s*56/);
    assert.match(week, /navButton:\s*\{[\s\S]*?height:\s*44/);
    assert.match(week, /navRow:\s*\{[\s\S]*?marginBottom:\s*4/);
    assert.match(promise, /lineHeight:\s*20/);
    assert.match(promise, /lineHeight:\s*18/);
    assert.match(promise, /rowSmall:\s*\{[^}]*marginTop:\s*12/);
    assert.match(promise, /rowSmall:\s*\{[^}]*paddingVertical:\s*12/);
    assert.equal(weekStripBlock(true, true), 6 + 44 + 4 + 52);
    assert.equal(promiseBlock(true), 12 + 24 + 38);
  });
});
