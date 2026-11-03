import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { flushQueuedTab, queueTabFromUrl, tabFromUrl, type TabLinkNavigation } from './tabLink';

describe('tabFromUrl', () => {
  it('reads plan and activity from host or path on any scheme', () => {
    assert.equal(tabFromUrl('iharu://plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('iharu://activity'), 'Activities');
    assert.equal(tabFromUrl('iharu://activity/'), 'Activities');
    assert.equal(tabFromUrl('iharu:///plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('com.dailyschedule.app://plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('com.dailyschedule.app://activity'), 'Activities');
    assert.equal(tabFromUrl('exp+daily-schedule-app://plan'), 'PlanSchedule');
    assert.equal(tabFromUrl('iharu://PLAN?x=1'), 'PlanSchedule');
    assert.equal(tabFromUrl('iharu://activity#shot'), 'Activities');
  });

  it('ignores empty, unknown, and ordinary web urls', () => {
    assert.equal(tabFromUrl(null), null);
    assert.equal(tabFromUrl(''), null);
    assert.equal(tabFromUrl('iharu://'), null);
    assert.equal(tabFromUrl('iharu://today'), null);
    assert.equal(tabFromUrl('not a url'), null);
    assert.equal(tabFromUrl('https://example.com/plan'), null);
    assert.equal(tabFromUrl('exp+daily-schedule-app://expo-development-client/?url=1'), null);
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
    assert.equal(queueTabFromUrl('iharu://today'), null);
    assert.equal(flushQueuedTab(navigation), false);
  });
});
