/**
 * Settings-lock screen state machine.
 *
 * loading  - PIN not read yet: show a neutral placeholder (never settings,
 *            never the gate), so nothing flashes on first open.
 * off      - no PIN: settings are open.
 * locked   - PIN set and not entered this visit: show the gate.
 * unlocked - PIN set and entered: settings are open until they leave or
 *            background. Turning the lock on (or restoring a backup that
 *            has a PIN) locks right away so the parent sees it working.
 */
export type LockState = 'loading' | 'off' | 'locked' | 'unlocked';

export type LockEvent =
  | { type: 'LOADED'; hasPin: boolean }
  | { type: 'LEAVE' } // tab blur or app goes to background
  | { type: 'UNLOCK_OK' }
  | { type: 'ENABLED' }
  | { type: 'DISABLED' }
  /** Forgot PIN: the parent check passed and the PIN was removed. */
  | { type: 'RECOVERED' }
  /** Restore or reset finished: follow the PIN the data now has. */
  | { type: 'DATA_REPLACED'; hasPin: boolean };

export function lockReducer(state: LockState, event: LockEvent): LockState {
  switch (event.type) {
    case 'LOADED':
      return state === 'loading' ? (event.hasPin ? 'locked' : 'off') : state;
    case 'LEAVE':
      return state === 'unlocked' ? 'locked' : state;
    case 'UNLOCK_OK':
      return state === 'locked' ? 'unlocked' : state;
    case 'ENABLED':
      return state === 'off' || state === 'unlocked' ? 'locked' : state;
    case 'DISABLED':
      // From locked too: rolls back a lock whose save failed.
      return state === 'unlocked' || state === 'locked' ? 'off' : state;
    case 'RECOVERED':
      return state === 'locked' ? 'off' : state;
    case 'DATA_REPLACED':
      if (state === 'loading' || state === 'locked') return state;
      return event.hasPin ? 'locked' : 'off';
  }
}

export type LockView = 'placeholder' | 'gate' | 'settings';

export function lockView(state: LockState): LockView {
  if (state === 'loading') return 'placeholder';
  return state === 'locked' ? 'gate' : 'settings';
}
