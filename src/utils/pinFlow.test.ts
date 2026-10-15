import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decidePinStep, normalizePin } from './pinFlow';

describe('decidePinStep', () => {
  it('on, then off, then on again', () => {
    let stored: string | null = null;
    const a = decidePinStep({ mode: 'set', pin: '1234', storedPin: stored, pendingPin: '' });
    assert.deepEqual(a, { kind: 'toConfirm', pendingPin: '1234' });
    const b = decidePinStep({ mode: 'confirm', pin: '1234', storedPin: stored, pendingPin: '1234' });
    assert.deepEqual(b, { kind: 'save', pin: '1234' });
    stored = '1234';
    assert.deepEqual(decidePinStep({ mode: 'unlock', pin: '1234', storedPin: stored, pendingPin: '' }), { kind: 'unlocked' });
    assert.equal(decidePinStep({ mode: 'remove', pin: '9999', storedPin: stored, pendingPin: '' }).kind, 'error');
    assert.deepEqual(decidePinStep({ mode: 'remove', pin: '1234', storedPin: stored, pendingPin: '' }), { kind: 'clear' });
    stored = null;
    assert.deepEqual(decidePinStep({ mode: 'set', pin: '5678', storedPin: stored, pendingPin: '1234' }), { kind: 'toConfirm', pendingPin: '5678' });
    assert.deepEqual(decidePinStep({ mode: 'confirm', pin: '5678', storedPin: stored, pendingPin: '5678' }), { kind: 'save', pin: '5678' });
  });
  it('rejects a mismatched confirm and a wrong unlock', () => {
    assert.equal(decidePinStep({ mode: 'confirm', pin: '1235', storedPin: null, pendingPin: '1234' }).kind, 'error');
    assert.equal(decidePinStep({ mode: 'unlock', pin: '0000', storedPin: '1234', pendingPin: '' }).kind, 'error');
  });
  it('ignores incomplete input or no open step', () => {
    assert.equal(decidePinStep({ mode: 'remove', pin: '123', storedPin: '1234', pendingPin: '' }).kind, 'ignore');
    assert.equal(decidePinStep({ mode: null, pin: '1234', storedPin: '1234', pendingPin: '' }).kind, 'ignore');
  });
});

describe('normalizePin', () => {
  it('keeps the first 4 digits only', () => {
    assert.equal(normalizePin(' 12a3456'), '1234');
    assert.equal(normalizePin(''), '');
  });
});
