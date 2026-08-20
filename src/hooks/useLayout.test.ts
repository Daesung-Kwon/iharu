import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLayoutMetrics, TAB_BAR_HEIGHT } from './layoutMetrics';
import { BREAKPOINTS } from '../constants/config';

describe('getLayoutMetrics', () => {
  it('treats 375 portrait as compact two-column activities', () => {
    const layout = getLayoutMetrics(375, 667);
    assert.equal(layout.isCompact, true);
    assert.equal(layout.isLandscape, false);
    assert.equal(layout.space, 16);
    assert.equal(layout.titleSize, 22);
    assert.equal(layout.activityColumns, 2);
    assert.equal(layout.dateCardWidth, 56);
    assert.equal(layout.tabBarHeight, TAB_BAR_HEIGHT);
  });

  it('uses three activity columns in compact landscape', () => {
    const layout = getLayoutMetrics(667, 375);
    assert.equal(layout.isCompact, true);
    assert.equal(layout.isLandscape, true);
    assert.equal(layout.activityColumns, 3);
  });

  it('keeps tablet portrait on the regular two-pane breakpoint', () => {
    const layout = getLayoutMetrics(BREAKPOINTS.tablet, 1024);
    assert.equal(layout.isCompact, false);
    assert.equal(layout.space, 32);
    assert.equal(layout.titleSize, 28);
    assert.equal(layout.activityColumns, 4);
    assert.equal(layout.dateCardWidth, 80);
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

  it('keeps phone landscape compact so 844×390 stays one-column', () => {
    const layout = getLayoutMetrics(844, 390);
    assert.equal(layout.isCompact, true);
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
});
