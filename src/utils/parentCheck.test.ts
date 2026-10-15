import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeProblem, isCorrectAnswer, formatProblem, recordWrong, cooldownSecondsLeft,
  initialRecovery, FIRST_FACTORS, SECOND_FACTORS, COOLDOWN_MS,
} from './parentCheck';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };

describe('makeProblem', () => {
  it('stays in range and avoids trivial factors', () => {
    for (let i = 0; i < 500; i++) {
      const p = makeProblem();
      assert.ok(p.a >= 23 && p.a <= 98 && p.a % 10 !== 0 && p.a % 11 !== 0);
      assert.ok(![0, 1, 2, 5, 10, 11, 15].includes(p.b));
      assert.equal(p.answer, p.a * p.b);
      assert.ok(p.answer >= 69 && p.answer <= 1862, String(p.answer));
    }
    assert.ok(!FIRST_FACTORS.some((n) => n % 10 === 0 || n % 11 === 0));
    assert.ok(!SECOND_FACTORS.some((n) => [1, 2, 5, 10, 11, 15].includes(n)));
  });
  it('never repeats the previous problem', () => {
    const prev = makeProblem(seq(0, 0));
    const next = makeProblem(seq(0, 0), prev);
    assert.notDeepEqual([next.a, next.b], [prev.a, prev.b]);
  });
  it('formats with a multiplication sign', () => {
    assert.equal(formatProblem({ a: 37, b: 8, answer: 296 }), '37 × 8 = ?');
  });
});

describe('isCorrectAnswer', () => {
  it('checks digits only', () => {
    const p = { a: 37, b: 8, answer: 296 };
    assert.equal(isCorrectAnswer(p, '296'), true);
    assert.equal(isCorrectAnswer(p, ' 2 9 6'), true);
    assert.equal(isCorrectAnswer(p, '297'), false);
    assert.equal(isCorrectAnswer(p, ''), false);
  });
});

describe('cooldown', () => {
  it('starts after 3 wrong answers and ends after 30 seconds', () => {
    let s = initialRecovery;
    s = recordWrong(s, 0);
    s = recordWrong(s, 0);
    assert.equal(cooldownSecondsLeft(s, 0), 0);
    s = recordWrong(s, 1000);
    assert.equal(cooldownSecondsLeft(s, 1000), 30);
    assert.equal(cooldownSecondsLeft(s, 1000 + COOLDOWN_MS - 1), 1);
    assert.equal(cooldownSecondsLeft(s, 1000 + COOLDOWN_MS), 0);
    assert.equal(s.wrong, 0);
  });
});
