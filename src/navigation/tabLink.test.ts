import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  flushQueuedTab,
  queueTabFromLaunchValue,
  queueTabFromUrl,
  sheetFromLaunchValue,
  suppressWeeklyResultFromLaunchValue,
  tabFromLaunchValue,
  tabFromUrl,
  type TabLinkNavigation,
} from './tabLink';

describe('tabFromUrl', () => {
  it('reads today, plan, activity, and settings from host or path on any scheme', () => {
    assert.equal(tabFromUrl('iharu://today'), 'Today');
    assert.equal(tabFromUrl('iharu://plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('iharu://activity'), 'Activities');
    assert.equal(tabFromUrl('iharu://settings'), 'Profile');
    assert.equal(tabFromUrl('iharu://activity/'), 'Activities');
    assert.equal(tabFromUrl('iharu:///plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('com.dailyschedule.app://plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('com.dailyschedule.app://settings'), 'Profile');
    assert.equal(tabFromUrl('exp+daily-schedule-app://plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('iharu://PLAN?x=1'), 'PlanSchedule');
    assert.equal(tabFromUrl('iharu://activity#shot'), 'Activities');
  });

  it('ignores empty, unknown, and ordinary web urls', () => {
    assert.equal(tabFromUrl(null), null);
    assert.equal(tabFromUrl(''), null);
    assert.equal(tabFromUrl('iharu://'), null);
    assert.equal(tabFromUrl('iharu://nope'), null);
    assert.equal(tabFromUrl('not a url'), null);
    assert.equal(tabFromUrl('https://example.com/plan'), null);
    assert.equal(tabFromUrl('exp+daily-schedule-app://expo-development-client/?url=1'), null);
  });
});

describe('tabFromLaunchValue', () => {
  it('maps simctl -initialTab today|plan|activity|settings', () => {
    assert.equal(tabFromLaunchValue('today'), 'Today');
    assert.equal(tabFromLaunchValue('plan'), 'PlanSchedule');
    assert.equal(tabFromLaunchValue('activity'), 'Activities');
    assert.equal(tabFromLaunchValue('settings'), 'Profile');
    assert.equal(tabFromLaunchValue(' PLAN '), 'PlanSchedule');
    assert.equal(tabFromLaunchValue(' SETTINGS '), 'Profile');
    assert.equal(tabFromLaunchValue('iharu://activity'), 'Activities');
  });

  it('ignores other launch values', () => {
    assert.equal(tabFromLaunchValue(undefined), null);
    assert.equal(tabFromLaunchValue(''), null);
    assert.equal(tabFromLaunchValue('profile'), null);
    assert.equal(tabFromLaunchValue(1), null);
  });
});

describe('sheetFromLaunchValue', () => {
  it('maps simctl -openSheet weeklyPromise|rewardExpansion', () => {
    assert.equal(sheetFromLaunchValue('weeklyPromise'), 'weeklyPromise');
    assert.equal(sheetFromLaunchValue('weekly-promise'), 'weeklyPromise');
    assert.equal(sheetFromLaunchValue(' rewardExpansion '), 'rewardExpansion');
    assert.equal(sheetFromLaunchValue('reward-expansion'), 'rewardExpansion');
  });

  it('ignores other values so a normal launch opens no sheet', () => {
    assert.equal(sheetFromLaunchValue(undefined), null);
    assert.equal(sheetFromLaunchValue(null), null);
    assert.equal(sheetFromLaunchValue(''), null);
    assert.equal(sheetFromLaunchValue('plan'), null);
    assert.equal(sheetFromLaunchValue(1), null);
  });
});

describe('suppressWeeklyResultFromLaunchValue', () => {
  it('accepts the proof flag', () => {
    assert.equal(suppressWeeklyResultFromLaunchValue('1'), true);
    assert.equal(suppressWeeklyResultFromLaunchValue(' YES '), true);
    assert.equal(suppressWeeklyResultFromLaunchValue('true'), true);
    assert.equal(suppressWeeklyResultFromLaunchValue(true), true);
    assert.equal(suppressWeeklyResultFromLaunchValue(1), true);
  });

  it('stays off when the arg is absent or negative', () => {
    assert.equal(suppressWeeklyResultFromLaunchValue(undefined), false);
    assert.equal(suppressWeeklyResultFromLaunchValue(null), false);
    assert.equal(suppressWeeklyResultFromLaunchValue(''), false);
    assert.equal(suppressWeeklyResultFromLaunchValue('0'), false);
    assert.equal(suppressWeeklyResultFromLaunchValue('false'), false);
    assert.equal(suppressWeeklyResultFromLaunchValue(false), false);
    assert.equal(suppressWeeklyResultFromLaunchValue(0), false);
  });
});

describe('flushQueuedTab', () => {
  it('holds the tab until navigation is ready, then opens it once', () => {
    const calls: string[] = [];
    let ready = false;
    const navigation: TabLinkNavigation = {
      isReady: () => ready,
      navigate: (_name, params) => { calls.push(params.screen); },
    };

    assert.equal(queueTabFromUrl('iharu://plan'), 'PlanSchedule');
    assert.equal(flushQueuedTab(navigation), false);
    assert.deepEqual(calls, []);

    ready = true;
    assert.equal(flushQueuedTab(navigation), true);
    assert.deepEqual(calls, ['PlanSchedule']);
    assert.equal(flushQueuedTab(navigation), false);

    assert.equal(queueTabFromUrl('com.dailyschedule.app://activity'), 'Activities');
    assert.equal(flushQueuedTab(navigation), true);
    assert.deepEqual(calls, ['PlanSchedule', 'Activities']);
    assert.equal(queueTabFromUrl('iharu://nope'), null);
    assert.equal(flushQueuedTab(navigation), false);

    assert.equal(queueTabFromLaunchValue('settings'), 'Profile');
    assert.equal(flushQueuedTab(navigation), true);
    assert.deepEqual(calls, ['PlanSchedule', 'Activities', 'Profile']);
    assert.equal(queueTabFromLaunchValue('today'), 'Today');
    assert.equal(flushQueuedTab(navigation), true);
    assert.deepEqual(calls, ['PlanSchedule', 'Activities', 'Profile', 'Today']);

    assert.equal(queueTabFromLaunchValue('activity'), 'Activities');
    assert.equal(flushQueuedTab(navigation), true);
    assert.deepEqual(calls, ['PlanSchedule', 'Activities', 'Profile', 'Today', 'Activities']);
    assert.equal(queueTabFromUrl(null), null);
    assert.equal(flushQueuedTab(navigation), false);
  });
});
