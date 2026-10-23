import test from 'node:test';
import assert from 'node:assert/strict';
import type { Schedule } from '../types';
import {
  cardCopy, currentWeekStatus, judgeEndedWeeks, latestUnseen, markAllSeen, pendingChange,
  resultCopy, saveTerms, stopPromise, termsForWeek, weekOf, WeeklyPromise,
} from './weeklyPromise';

const day = (date: string, completed: number, total: number): Pick<Schedule, 'date' | 'items'> => ({
  date,
  items: Array.from({ length: total }, (_, i) => ({
    id: `${date}-${i}`, scheduleId: `s-${date}`, activityId: 'a', startTime: '09:00', endTime: '09:30',
    status: i < completed ? 'completed' : 'planned', orderIndex: i, createdAt: '', updatedAt: '',
  })),
});
const opts = (today: string) => ({ today, nowIso: `${today}T00:00:00Z`, newId: 'promise-1' });
// 2026-10-12 and 2026-10-19 are Mondays.
const first = (): WeeklyPromise => saveTerms(null, { reward: '  게임 재화  ', goalPercent: 80 }, opts('2026-10-14'));

test('weekOf is Mon-Sun', () => {
  assert.deepEqual(weekOf('2026-10-18'), { start: '2026-10-12', end: '2026-10-18' });
  assert.deepEqual(weekOf('2026-10-19'), { start: '2026-10-19', end: '2026-10-25' });
});

test('first setup applies this week, with a stable id and trimmed reward', () => {
  const p = first();
  assert.equal(p.id, 'promise-1');
  assert.deepEqual(p.terms, [{ reward: '게임 재화', goalPercent: 80, effectiveFrom: '2026-10-12' }]);
  assert.equal(termsForWeek(p, '2026-10-12')?.reward, '게임 재화');
});

test('a change applies next week; this week keeps the old terms', () => {
  const p = saveTerms(first(), { reward: '공원 가기', goalPercent: 70 }, opts('2026-10-16'));
  assert.equal(p.id, 'promise-1');
  assert.equal(termsForWeek(p, '2026-10-12')?.reward, '게임 재화');
  assert.deepEqual(termsForWeek(p, '2026-10-19'), { reward: '공원 가기', goalPercent: 70, effectiveFrom: '2026-10-19' });
  assert.deepEqual(pendingChange(p, '2026-10-16'), { kind: 'change', terms: termsForWeek(p, '2026-10-19') });
  // Saving the current terms again cancels the pending change.
  const back = saveTerms(p, { reward: '게임 재화', goalPercent: 80 }, opts('2026-10-17'));
  assert.deepEqual(pendingChange(back, '2026-10-17'), { kind: 'none' });
  assert.equal(termsForWeek(back, '2026-10-19')?.reward, '게임 재화');
});

test('stopping keeps this week and ends next Monday; saving again resumes', () => {
  const stopped = stopPromise(first(), { today: '2026-10-15', nowIso: 'n' });
  assert.equal(stopped.endsFrom, '2026-10-19');
  assert.ok(termsForWeek(stopped, '2026-10-12'));
  assert.equal(termsForWeek(stopped, '2026-10-19'), null);
  assert.deepEqual(pendingChange(stopped, '2026-10-15'), { kind: 'stop', from: '2026-10-19' });
  // A week later it is not running, so a new save starts that week right away.
  const resumed = saveTerms(stopped, { reward: '책', goalPercent: 60 }, opts('2026-10-21'));
  assert.equal(resumed.endsFrom, null);
  assert.equal(termsForWeek(resumed, '2026-10-19')?.reward, '책');
  assert.equal(termsForWeek(resumed, '2026-10-12')?.reward, '게임 재화');
});

test('mid-week card counts fully done days with to-dos; today counts only when done', () => {
  const schedules = [day('2026-10-12', 2, 2), day('2026-10-13', 1, 2), day('2026-10-14', 0, 0), day('2026-10-15', 0, 3)];
  const s = currentWeekStatus(first(), schedules, '2026-10-15');
  assert.ok(s);
  assert.deepEqual(s.progress, { doneDays: 1, countedDays: 2, rate: 50 });
  assert.deepEqual(cardCopy(s), { title: '이번 주 약속: 게임 재화', detail: '2일 중 1일 다 끝냈어요 (목표 80%)' });
  assert.equal(currentWeekStatus(null, schedules, '2026-10-15'), null);
});

test('a week is judged only after it ends: achieved at exactly the goal', () => {
  const p = first();
  const schedules = ['12', '13', '14', '15', '16'].map((d, i) => day(`2026-10-${d}`, i < 4 ? 1 : 0, 1));
  assert.deepEqual(judgeEndedWeeks(p, [], schedules, { today: '2026-10-18', nowIso: 'n' }), []);
  const [r] = judgeEndedWeeks(p, [], schedules, { today: '2026-10-19', nowIso: 'n' });
  assert.equal(r.id, 'promise-1:2026-10-12');
  assert.deepEqual([r.doneDays, r.countedDays, r.rate, r.achieved], [4, 5, 80, true]);
  assert.deepEqual(resultCopy(r), { title: '지난주 약속을 지켰어요!', body: '5일 중 4일 다 끝냈어요 (80%)', footer: '약속한 보상: 게임 재화' });
  // Already judged → not judged again.
  assert.deepEqual(judgeEndedWeeks(p, [r], schedules, { today: '2026-10-20', nowIso: 'n' }), []);
});

test('missed week: what was achieved comes first, no partial reward', () => {
  const schedules = [day('2026-10-12', 1, 1), day('2026-10-13', 0, 1), day('2026-10-14', 1, 2)];
  const [r] = judgeEndedWeeks(first(), [], schedules, { today: '2026-10-20', nowIso: 'n' });
  assert.equal(r.achieved, false);
  const copy = resultCopy(r);
  assert.equal(copy.body, '3일 중 1일 다 끝냈어요 (33%)');
  assert.ok(!copy.footer.includes('게임 재화'));
});

test('a week with no to-dos gets no result; old terms judge old weeks', () => {
  const p = saveTerms(first(), { reward: '공원', goalPercent: 50 }, opts('2026-10-16'));
  const schedules = [day('2026-10-12', 1, 2), day('2026-10-13', 1, 1), day('2026-10-20', 1, 1)];
  const results = judgeEndedWeeks(p, [], schedules, { today: '2026-11-02', nowIso: 'n' });
  assert.deepEqual(results.map(r => [r.weekStart, r.goalPercent, r.achieved]), [
    ['2026-10-12', 80, false],
    ['2026-10-19', 50, true],
  ]);
});

test('only the newest unseen result is shown, once', () => {
  const schedules = [day('2026-10-12', 1, 1), day('2026-10-19', 1, 1)];
  const results = judgeEndedWeeks(first(), [], schedules, { today: '2026-10-26', nowIso: 'n' });
  assert.equal(latestUnseen(results)?.weekStart, '2026-10-19');
  const seen = markAllSeen(results, 'later');
  assert.equal(latestUnseen(seen), null);
  assert.ok(seen.every(r => r.seenAt === 'later'));
});
