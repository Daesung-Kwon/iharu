import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BrandAccent } from '../constants/theme';
import { getLayoutMetrics, getTabBarChrome, MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';
import { LARGE_TITLE_SCALE_END } from '../hooks/collapsingHeader';
import { getBottomChrome, getScrollEndPadding, SCROLL_END_GAP } from '../utils/safeArea';
import {
  ACTIVITY_ADD_ICON,
  ACTIVITY_ADD_LABEL,
  ACTIVITY_TITLE,
  activityCollapsingMetrics,
  activityHeaderContentGap,
  activityHeaderPresentation,
  activityHeaderType,
  activityListGap,
  activityListPadding,
} from './activityHeader';

const root = join(__dirname, '..', '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

const DEVICES = [
  { label: 'iPhone SE', width: 375, height: 667, os: 'ios', inset: 0 },
  { label: 'iPhone Pro', width: 402, height: 874, os: 'ios', inset: 34 },
  { label: 'iPad', width: 820, height: 1180, os: 'ios', inset: 20 },
  { label: 'Android phone', width: 360, height: 640, os: 'android', inset: 24 },
] as const;

function scrollEndPadding(width: number, height: number, os: 'ios' | 'android', inset: number) {
  const layout = getLayoutMetrics(width, height);
  const chrome = getTabBarChrome(layout.tier, inset, os);
  return {
    layout,
    end: getScrollEndPadding(getBottomChrome(chrome.offset, 0)),
    chrome,
  };
}

describe('activity header geometry', () => {
  it('keeps the SE card at the old padded height and a 44pt compact row', () => {
    const layout = getLayoutMetrics(375, 667);
    const metrics = activityCollapsingMetrics(layout);
    assert.equal(layout.space, 12);
    assert.equal(layout.titleSize, 20);
    assert.equal(metrics.expandedHeight, 12 + MIN_TOUCH_TARGET + 12 + 4);
    assert.equal(metrics.compactHeight, 4 + MIN_TOUCH_TARGET + 4 + 4);
    assert.ok(metrics.compactHeight >= MIN_TOUCH_TARGET);
    assert.ok(metrics.expandedHeight > metrics.compactHeight);
    assert.equal(metrics.compactPaddingVertical, 4);
  });

  it('gives every checked device a real collapse and a 44pt target', () => {
    for (const device of DEVICES) {
      const layout = getLayoutMetrics(device.width, device.height);
      const metrics = activityCollapsingMetrics(layout);
      assert.ok(metrics.expandedHeight > metrics.compactHeight, device.label);
      assert.ok(metrics.compactHeight >= MIN_TOUCH_TARGET, device.label);
      const inner = metrics.compactHeight - metrics.compactPaddingVertical * 2 - metrics.borderWidth * 2;
      assert.equal(inner, MIN_TOUCH_TARGET, device.label);
    }
  });
});

describe('activity list inset', () => {
  it('passes the shared scroll-end padding through on SE, Pro, iPad, and Android', () => {
    for (const device of DEVICES) {
      const { layout, end, chrome } = scrollEndPadding(device.width, device.height, device.os, device.inset);
      const metrics = activityCollapsingMetrics(layout);
      const padding = activityListPadding({
        space: layout.space,
        expandedHeight: metrics.expandedHeight,
        scrollEndPadding: end,
      });
      assert.equal(padding.paddingBottom, end, device.label);
      assert.equal(padding.paddingBottom, chrome.offset + SCROLL_END_GAP, device.label);
      assert.equal(padding.paddingHorizontal, layout.space);
      assert.ok(padding.paddingTop > metrics.expandedHeight, device.label);
    }
  });

  it('holds the gap under the bar while it collapses, then lets the list pass behind it', () => {
    for (const device of DEVICES) {
      const layout = getLayoutMetrics(device.width, device.height);
      const metrics = activityCollapsingMetrics(layout);
      const distance = metrics.expandedHeight - metrics.compactHeight;
      const gap = activityListGap(layout.space);
      for (const y of [0, distance / 2, distance]) {
        assert.equal(activityHeaderContentGap({
          scrollY: y,
          space: layout.space,
          expandedHeight: metrics.expandedHeight,
          compactHeight: metrics.compactHeight,
          reduceMotion: false,
        }), gap, `${device.label} @ ${y}`);
      }
      const behind = activityHeaderContentGap({
        scrollY: distance + gap + 8,
        space: layout.space,
        expandedHeight: metrics.expandedHeight,
        compactHeight: metrics.compactHeight,
        reduceMotion: false,
      });
      assert.ok(behind < 0, `${device.label} should scroll behind the bar`);
    }
  });

  it('Reduce Motion snaps without covering the first row before the collapse distance', () => {
    for (const device of DEVICES) {
      const layout = getLayoutMetrics(device.width, device.height);
      const metrics = activityCollapsingMetrics(layout);
      const distance = metrics.expandedHeight - metrics.compactHeight;
      for (const y of [0, distance * 0.49, distance * 0.5, distance]) {
        const gap = activityHeaderContentGap({
          scrollY: y,
          space: layout.space,
          expandedHeight: metrics.expandedHeight,
          compactHeight: metrics.compactHeight,
          reduceMotion: true,
        });
        assert.ok(gap >= 0, `${device.label} gap ${gap} at ${y}`);
      }
    }
  });
});

describe('activity header presentation', () => {
  const se = activityCollapsingMetrics(getLayoutMetrics(375, 667));
  const distance = se.expandedHeight - se.compactHeight;

  it('renders the expanded card at the top of the list', () => {
    const view = activityHeaderPresentation(0, {
      reduceMotion: false,
      expandedHeight: se.expandedHeight,
      compactHeight: se.compactHeight,
      titleSize: 20,
    });
    assert.equal(view.title, ACTIVITY_TITLE);
    assert.equal(view.title, '활동 관리');
    assert.equal(view.progress, 0);
    assert.equal(view.height, se.expandedHeight);
    assert.equal(view.largeOpacity, 1);
    assert.equal(view.largeScale, 1);
    assert.equal(view.compactOpacity, 0);
    assert.equal(view.largeHeaderRole, 'header');
    assert.equal(view.largeHidden, false);
    assert.equal(view.compactHidden, true);
    assert.equal(view.showSubtitle, false);
    assert.equal(view.addVisible, true);
  });

  it('renders the compact one-line header once the list has scrolled the collapse', () => {
    const view = activityHeaderPresentation(distance + 12, {
      reduceMotion: false,
      expandedHeight: se.expandedHeight,
      compactHeight: se.compactHeight,
      titleSize: 20,
    });
    assert.equal(view.progress, 1);
    assert.equal(view.height, se.compactHeight);
    assert.equal(view.largeOpacity, 0);
    assert.equal(view.largeScale, LARGE_TITLE_SCALE_END);
    assert.equal(view.compactOpacity, 1);
    assert.equal(view.subtitleOpacity, 0);
    assert.equal(view.largeHidden, true);
    assert.equal(view.largeHeaderRole, null);
    assert.equal(view.compactHidden, false);
    assert.equal(view.compactHeaderRole, 'header');
    assert.equal(view.compactFontSize, 17);
    assert.equal(view.compactFontFamily, 'BMJUA');
    assert.equal(view.largeFontFamily, 'BMJUA');
    assert.equal(view.addLabel, ACTIVITY_ADD_LABEL);
    assert.equal(view.addLabel, '활동 추가');
    assert.equal(view.addIcon, ACTIVITY_ADD_ICON);
    assert.equal(view.addIcon, 'ih-add-circle');
    assert.equal(view.addColor, '#F0565A');
    assert.equal(view.addColor, BrandAccent.strong);
    assert.notEqual(view.addColor, '#FF6B6B');
    assert.equal(view.addMinTouch, 44);
    assert.equal(view.addMinTouch, MIN_TOUCH_TARGET);
    assert.equal(view.addVisible, true);
  });

  it('uses the section title size on iPad and snaps back when scroll returns to the top', () => {
    const tablet = activityHeaderType(28);
    assert.equal(tablet.compactFontSize, 20);
    assert.equal(tablet.largeFontSize, 28);
    const collapsed = activityHeaderPresentation(distance, {
      reduceMotion: false,
      expandedHeight: se.expandedHeight,
      compactHeight: se.compactHeight,
      titleSize: 20,
    });
    assert.equal(collapsed.compactHidden, false);
    const restored = activityHeaderPresentation(0, {
      reduceMotion: false,
      expandedHeight: se.expandedHeight,
      compactHeight: se.compactHeight,
      titleSize: 20,
    });
    assert.equal(restored.largeHidden, false);
    assert.equal(restored.compactHidden, true);
    assert.equal(restored.height, se.expandedHeight);
  });

  it('Reduce Motion jumps between the two render states', () => {
    const shared = {
      expandedHeight: se.expandedHeight,
      compactHeight: se.compactHeight,
      titleSize: 22,
    };
    const before = activityHeaderPresentation(distance * 0.49, { ...shared, reduceMotion: true });
    const after = activityHeaderPresentation(distance * 0.5, { ...shared, reduceMotion: true });
    assert.equal(before.progress, 0);
    assert.equal(before.largeOpacity, 1);
    assert.equal(before.compactOpacity, 0);
    assert.equal(before.height, se.expandedHeight);
    assert.equal(before.largeHeaderRole, 'header');
    assert.equal(after.progress, 1);
    assert.equal(after.largeOpacity, 0);
    assert.equal(after.compactOpacity, 1);
    assert.equal(after.height, se.compactHeight);
    assert.equal(after.compactHeaderRole, 'header');
    assert.equal(after.compactHidden, false);
    const smooth = activityHeaderPresentation(distance * 0.5, { ...shared, reduceMotion: false });
    assert.equal(smooth.progress, 0.5);
    assert.ok(smooth.largeOpacity > 0);
    assert.ok(smooth.height < se.expandedHeight);
    assert.ok(smooth.height > se.compactHeight);
  });
});

describe('activity header wiring', () => {
  it('the screen collapses with the shared contract and keeps scrollEndPadding', () => {
    const screen = read('src/screens/ActivitiesScreen.tsx');
    const header = read('src/components/CollapsingHeader.tsx');
    const hook = read('src/hooks/useCollapsingHeader.ts');
    for (const token of [
      'useCollapsingHeader',
      'CollapsingHeader',
      'activityListPadding',
      'scrollEndPadding',
      'BrandAccent.strong',
      'MIN_TOUCH_TARGET',
      'IhIcon',
      'activity-add-button',
      'accessibilityLabel={label}',
      'accessibilityRole="button"',
    ]) {
      assert.ok(screen.includes(token), token);
    }
    for (const token of [
      'stopRanges(LARGE_TITLE_OPACITY_STOPS)',
      'stopRanges(COMPACT_TITLE_OPACITY_STOPS)',
      'stopRanges(SUBTITLE_OPACITY_STOPS)',
      'LARGE_TITLE_SCALE_END',
      'accessibilityRole="header"',
      'accessibilityElementsHidden',
    ]) {
      assert.ok(header.includes(token), token);
    }
    assert.match(hook, /useNativeDriver:\s*true/);
    assert.match(hook, /scrollProgressStops/);
    assert.match(hook, /useReduceMotion/);
    const cardElevation = Number(read('src/components/ActivityCard.tsx').match(/elevation:\s*(\d+)/)?.[1]);
    const headerElevation = Number(header.match(/HEADER_ELEVATION = (\d+)/)?.[1]);
    assert.ok(headerElevation > cardElevation);
  });
});
