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

/* ── Past days are read-only (same rule as the Today tab) ───────────────── */

export const PAST_DAY_NOTICE = '지난 날은 기록만 볼 수 있어요';

const dayNumber = (d: Date): number => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

/**
 * Plan can add / delete / clear only on today or later (local calendar day).
 * Today stays fully editable, including items whose time has already passed,
 * so a slip in today's plan can still be fixed.
 */
export const isPlanDayEditable = (date: Date, today: Date = new Date()): boolean =>
  dayNumber(date) >= dayNumber(today);

/** "월~금 반복" never writes into days that are already over. */
export const filterEditableDays = (dates: Date[], today: Date = new Date()): Date[] =>
  dates.filter(d => isPlanDayEditable(d, today));

export const WEEKDAYS_ADDED_MESSAGE =
  '이번 주 월~금에 같은 시간으로 넣었어요. 지난 날과 이미 일정이 있는 날은 건너뛰었어요.';

export const COPY_TITLE = '일정 복사';
export const getCopyMessage = (date: Date, todayHasItems: boolean, today: Date = new Date()): string =>
  todayHasItems
    ? '오늘 이미 일정이 있습니다. 기존 일정을 삭제하고 복사하시겠습니까?'
    : `${formatPlanDayLabel(date, today)} 일정을 오늘로 복사하시겠습니까?`;

/**
 * The way out of a read-only past day: copy it to today (Today and Plan share this).
 * `onCopy(overwrite)` runs only from the confirm button.
 */
export const confirmCopyToToday = (params: {
  alert: AlertFn;
  date: Date;
  todayHasItems: boolean;
  onCopy: (overwrite: boolean) => void;
  today?: Date;
}): void => {
  const { alert, date, todayHasItems, onCopy, today } = params;
  alert(COPY_TITLE, getCopyMessage(date, todayHasItems, today), [
    { text: '취소', style: 'cancel' },
    todayHasItems
      ? { text: '삭제하고 복사', style: 'destructive', onPress: () => onCopy(true) }
      : { text: '복사', onPress: () => onCopy(false) },
  ]);
};
