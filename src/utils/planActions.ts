/**
 * Plan screen actions that need a confirmation step.
 * Kept free of React Native imports so the flow can be unit-tested with a fake `alert`.
 */

export type ConfirmButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

/** Same signature as React Native's `Alert.alert` (title, message, buttons). */
export type AlertFn = (title: string, message?: string, buttons?: ConfirmButton[]) => void;

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

/** "10월 8일 (목)", or "오늘, 10월 8일 (목)" when `date` is `today`. */
export const formatPlanDayLabel = (date: Date, today: Date = new Date()): string => {
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS_KO[date.getDay()]})`;
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  return sameDay ? `오늘, ${label}` : label;
};

export const DELETE_ALL_TITLE = '일정을 모두 삭제할까요?';
export const DELETE_ALL_CANCEL = '취소';
export const DELETE_ALL_CONFIRM = '삭제';

export const getDeleteAllMessage = (date: Date, count: number, today: Date = new Date()): string =>
  `${formatPlanDayLabel(date, today)} 일정 ${count}개가 모두 지워져요.\n되돌릴 수 없어요.`;

/**
 * Asks before wiping a day. `onConfirm` runs only from the destructive "삭제" button;
 * "취소" and dismissing the alert leave the schedule untouched.
 */
export const confirmDeleteAllSchedule = (params: {
  alert: AlertFn;
  date: Date;
  count: number;
  onConfirm: () => void;
  today?: Date;
}): void => {
  const { alert, date, count, onConfirm, today } = params;
  if (count <= 0) return;
  alert(DELETE_ALL_TITLE, getDeleteAllMessage(date, count, today), [
    { text: DELETE_ALL_CANCEL, style: 'cancel' },
    { text: DELETE_ALL_CONFIRM, style: 'destructive', onPress: onConfirm },
  ]);
};
