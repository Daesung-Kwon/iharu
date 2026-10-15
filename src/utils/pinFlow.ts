/**
 * Settings-lock PIN steps as a pure decision, so the screen never compares
 * against a stale value and can close the modal before touching storage.
 */
export type PinMode = 'unlock' | 'set' | 'confirm' | 'remove';

export type PinDecision =
  | { kind: 'unlocked' }
  | { kind: 'toConfirm'; pendingPin: string }
  | { kind: 'save'; pin: string }
  | { kind: 'clear' }
  | { kind: 'error'; message: string }
  | { kind: 'ignore' };

export const PIN_LENGTH = 4;

/** Keep digits only, at most 4. */
export function normalizePin(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PIN_LENGTH);
}

export function decidePinStep({
  mode,
  pin,
  storedPin,
  pendingPin,
}: {
  mode: PinMode | null;
  pin: string;
  storedPin: string | null;
  pendingPin: string;
}): PinDecision {
  const entered = normalizePin(pin);
  if (!mode || entered.length !== PIN_LENGTH) return { kind: 'ignore' };
  switch (mode) {
    case 'unlock':
      return entered === storedPin ? { kind: 'unlocked' } : { kind: 'error', message: '비밀번호가 달라요' };
    case 'set':
      return { kind: 'toConfirm', pendingPin: entered };
    case 'confirm':
      return entered === pendingPin
        ? { kind: 'save', pin: entered }
        : { kind: 'error', message: '다시 입력한 숫자가 달라요' };
    case 'remove':
      return entered === storedPin ? { kind: 'clear' } : { kind: 'error', message: '비밀번호가 달라요' };
  }
}
