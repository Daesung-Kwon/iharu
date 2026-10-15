import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lockReducer, lockView, LockState, LockEvent } from './lockState';

const run = (s: LockState, ...evs: LockEvent[]) => evs.reduce(lockReducer, s);

describe('lockReducer', () => {
  it('forgot PIN: the parent check opens settings with the lock off', () => {
    assert.equal(run('locked', { type: 'RECOVERED' }), 'off');
    assert.equal(run('loading', { type: 'RECOVERED' }), 'loading');
    assert.equal(run('locked', { type: 'RECOVERED' }, { type: 'ENABLED' }), 'locked');
  });
  it('shows neither settings nor gate until the PIN is read', () => {
    assert.equal(lockView('loading'), 'placeholder');
    assert.equal(run('loading', { type: 'LEAVE' }), 'loading');
    assert.equal(run('loading', { type: 'LOADED', hasPin: true }), 'locked');
    assert.equal(run('loading', { type: 'LOADED', hasPin: false }), 'off');
  });
  it('enabling shows the gate right away and stays locked after leaving', () => {
    const s = run('off', { type: 'ENABLED' });
    assert.equal(lockView(s), 'gate');
    assert.equal(run(s, { type: 'LEAVE' }), 'locked');
  });
  it('unlock, leave, unlock again, then turn off', () => {
    let s = run('locked', { type: 'UNLOCK_OK' });
    assert.equal(s, 'unlocked');
    s = run(s, { type: 'LEAVE' }, { type: 'UNLOCK_OK' }, { type: 'DISABLED' });
    assert.equal(s, 'off');
    assert.equal(run(s, { type: 'LEAVE' }), 'off');
  });
  it('a late load never overrides a live state', () => {
    assert.equal(run('unlocked', { type: 'LOADED', hasPin: true }), 'unlocked');
  });
  it('restore or reset follows the restored PIN', () => {
    assert.equal(run('unlocked', { type: 'DATA_REPLACED', hasPin: false }), 'off');
    assert.equal(run('off', { type: 'DATA_REPLACED', hasPin: true }), 'locked');
    assert.equal(run('locked', { type: 'DATA_REPLACED', hasPin: true }), 'locked');
  });
  it('ignores events that do not apply', () => {
    assert.equal(run('off', { type: 'UNLOCK_OK' }), 'off');
    assert.equal(run('unlocked', { type: 'UNLOCK_OK' }), 'unlocked');
    assert.equal(run('loading', { type: 'DISABLED' }), 'loading');
  });
  it('a failed save rolls a fresh lock back to off', () => {
    assert.equal(run('off', { type: 'ENABLED' }, { type: 'DISABLED' }), 'off');
  });
});
