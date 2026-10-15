/**
 * Forgot-PIN parent check: one multiplication an adult can do but a young
 * child can't easily guess, plus a short cooldown after repeated misses.
 */
export interface MathProblem {
  a: number;
  b: number;
  answer: number;
}

/** Two-digit first factor: 23..98, no multiples of 10 or 11 (e.g. 40, 33). */
export const FIRST_FACTORS: number[] = Array.from({ length: 98 - 23 + 1 }, (_, i) => 23 + i)
  .filter((n) => n % 10 !== 0 && n % 11 !== 0);
/** Second factor: one digit without 1/2/5, or 12..19 without 15. */
export const SECOND_FACTORS: number[] = [3, 4, 6, 7, 8, 9, 12, 13, 14, 16, 17, 18, 19];

export const MAX_WRONG = 3;
export const COOLDOWN_MS = 30_000;

const pick = <T,>(list: T[], rand: () => number): T =>
  list[Math.min(list.length - 1, Math.floor(rand() * list.length))];

/** New problem; pass `previous` to never repeat it right away. */
export function makeProblem(rand: () => number = Math.random, previous?: MathProblem): MathProblem {
  for (let i = 0; i < 10; i++) {
    const a = pick(FIRST_FACTORS, rand);
    const b = pick(SECOND_FACTORS, rand);
    if (!previous || previous.a !== a || previous.b !== b) return { a, b, answer: a * b };
  }
  const a = previous && previous.a === 23 ? 24 : 23;
  return { a, b: 7, answer: a * 7 };
}

export function formatProblem(p: MathProblem): string {
  return `${p.a} × ${p.b} = ?`;
}

export function isCorrectAnswer(p: MathProblem, input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length > 0 && Number(digits) === p.answer;
}

export interface RecoveryState {
  wrong: number;
  cooldownUntil: number | null;
}

export const initialRecovery: RecoveryState = { wrong: 0, cooldownUntil: null };

/** Count a miss; the 3rd miss starts a cooldown and resets the count. */
export function recordWrong(state: RecoveryState, now: number): RecoveryState {
  const wrong = state.wrong + 1;
  return wrong >= MAX_WRONG
    ? { wrong: 0, cooldownUntil: now + COOLDOWN_MS }
    : { wrong, cooldownUntil: state.cooldownUntil };
}

export function cooldownSecondsLeft(state: RecoveryState, now: number): number {
  if (!state.cooldownUntil || now >= state.cooldownUntil) return 0;
  return Math.ceil((state.cooldownUntil - now) / 1000);
}
