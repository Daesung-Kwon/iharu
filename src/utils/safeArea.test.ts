import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getScreenEdges, getBottomChrome, getScrollEndPadding, getSheetBottomPadding,
  getVisibleAreaPaddingBottom, SCROLL_END_GAP,
} from './safeArea';
import { getTabBarChrome } from '../hooks/layoutMetrics';

describe('getScreenEdges', () => {
  it('always top, sides in landscape, never bottom', () => {
    assert.deepEqual(getScreenEdges(false), ['top']);
    assert.deepEqual(getScreenEdges(true), ['top', 'left', 'right']);
    assert.ok(!getScreenEdges(true).includes('bottom'));
  });
});

describe('bottom chrome and scroll end', () => {
  it('adds the ad only once it has a height', () => {
    assert.equal(getBottomChrome(76, 0), 76);
    assert.equal(getBottomChrome(76, 50), 126);
    assert.equal(getBottomChrome(76, -4), 76);
  });
  it('counts the Android gesture inset once', () => {
    const inset = 24;
    const chrome = getTabBarChrome('phoneRegular', inset, 'android');
    const end = getScrollEndPadding(getBottomChrome(chrome.offset, 0));
    // The tab bar offset already contains the inset; the screen adds no more.
    assert.equal(end, chrome.offset + SCROLL_END_GAP);
  });
  it('one end gap for every screen', () => {
    assert.equal(getScrollEndPadding(100), 100 + SCROLL_END_GAP);
  });
  it('centres the gate on the visible area', () => {
    assert.equal(getVisibleAreaPaddingBottom(126), 126);
  });
});

describe('getSheetBottomPadding', () => {
  it('uses the inset on notched phones and 16 on SE', () => {
    assert.equal(getSheetBottomPadding(34), 50);
    assert.equal(getSheetBottomPadding(0), 32);
    assert.equal(getSheetBottomPadding(20), 36);
  });
});
