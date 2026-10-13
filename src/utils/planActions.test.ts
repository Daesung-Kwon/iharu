import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AlertFn,
  ConfirmButton,
  confirmDeleteAllSchedule,
  DELETE_ALL_TITLE,
  formatPlanDayLabel,
  getDeleteAllMessage,
} from './planActions';

const makeAlert = () => {
  const calls: { title: string; message?: string; buttons: ConfirmButton[] }[] = [];
  const alert: AlertFn = (title, message, buttons) => {
    calls.push({ title, message, buttons: buttons ?? [] });
  };
  return { alert, calls };
};

const thu = new Date(2026, 9, 8);
const fri = new Date(2026, 9, 9);

test('confirmDeleteAllSchedule: asks first and does not delete on its own', () => {
  const { alert, calls } = makeAlert();
  let deleted = 0;
  confirmDeleteAllSchedule({ alert, date: thu, count: 3, onConfirm: () => { deleted++; }, today: thu });
  assert.equal(calls.length, 1);
  assert.equal(deleted, 0);
  assert.equal(calls[0].title, DELETE_ALL_TITLE);
  assert.deepEqual(calls[0].buttons.map(b => [b.text, b.style]), [['취소', 'cancel'], ['삭제', 'destructive']]);
});

test('confirmDeleteAllSchedule: 취소 keeps the schedule', () => {
  const { alert, calls } = makeAlert();
  let deleted = 0;
  confirmDeleteAllSchedule({ alert, date: thu, count: 3, onConfirm: () => { deleted++; } });
  calls[0].buttons.find(b => b.text === '취소')?.onPress?.();
  assert.equal(deleted, 0);
});

test('confirmDeleteAllSchedule: only 삭제 deletes, exactly once', () => {
  const { alert, calls } = makeAlert();
  let deleted = 0;
  confirmDeleteAllSchedule({ alert, date: thu, count: 3, onConfirm: () => { deleted++; } });
  calls[0].buttons.find(b => b.style === 'destructive')?.onPress?.();
  assert.equal(deleted, 1);
});

test('confirmDeleteAllSchedule: nothing to delete means no alert', () => {
  const { alert, calls } = makeAlert();
  confirmDeleteAllSchedule({ alert, date: thu, count: 0, onConfirm: () => { throw new Error('no'); } });
  assert.equal(calls.length, 0);
});

test('delete-all message names the day and the count', () => {
  assert.equal(formatPlanDayLabel(fri, thu), '10월 9일 (금)');
  assert.equal(formatPlanDayLabel(thu, thu), '오늘, 10월 8일 (목)');
  assert.equal(getDeleteAllMessage(fri, 4, thu), '10월 9일 (금) 일정 4개가 모두 지워져요.\n되돌릴 수 없어요.');
});
