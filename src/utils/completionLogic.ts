/**
 * Pure completion rules for the Today screen so swipe / button / undo stay
 * consistent and can be unit tested without React Native.
 */
import type { ScheduleItemStatus } from '../types';

export type CompletionSource = 'button' | 'swipe';

/** Minimal shape so callers can pass full ScheduleItems or test fixtures. */
export interface CompletionItem {
  id: string;
  status: ScheduleItemStatus;
}

export interface CompletionPlan {
  itemId: string;
  /** Status before the toggle; undo restores exactly this. */
  previousStatus: ScheduleItemStatus;
  nextStatus: ScheduleItemStatus;
  /** True only for a not-completed → completed transition. */
  completedNow: boolean;
  /** True when this toggle makes every item of the day completed. */
  completesDay: boolean;
  /** Vibration / haptic on completion. */
  haptic: boolean;
  /** Small clap overlay (button path, not the last item). */
  clap: boolean;
  /** "완료했어요 · 취소" toast (swipe path, not the last item). */
  undoToast: boolean;
  /** Full-day celebration modal (any path, last item). */
  celebrate: boolean;
}

/**
 * Decide what toggling one item does.
 *
 * - Last item (either source) → celebration only. The clap and undo toast are
 *   both Modals/overlays that would stack on top of / under the celebration.
 * - Swipe on a non-last item → undo toast (no clap: the clap Modal would block
 *   taps on the toast's 취소).
 * - Button on a non-last item → clap.
 */
export function planToggleComplete(
  items: readonly CompletionItem[],
  itemId: string,
  source: CompletionSource,
): CompletionPlan | null {
  const item = items.find(i => i.id === itemId);
  if (!item) return null;

  const previousStatus = item.status;
  const wasCompleted = previousStatus === 'completed';
  const nextStatus: ScheduleItemStatus = wasCompleted ? 'planned' : 'completed';
  const completedNow = !wasCompleted;
  const completesDay = completedNow
    && items.every(i => i.id === itemId || i.status === 'completed');

  return {
    itemId,
    previousStatus,
    nextStatus,
    completedNow,
    completesDay,
    haptic: completedNow,
    clap: completedNow && !completesDay && source === 'button',
    undoToast: completedNow && !completesDay && source === 'swipe',
    celebrate: completesDay,
  };
}

/**
 * The status undo should write. Always explicit (never "toggle again"), so a
 * stale closure or a double tap cannot flip the item back to completed.
 */
export function getUndoStatus(plan: Pick<CompletionPlan, 'previousStatus'>): ScheduleItemStatus {
  return plan.previousStatus === 'completed' ? 'planned' : plan.previousStatus;
}

export type ItemDisplayStatus = 'upcoming' | 'current' | 'completed' | 'missed' | 'future';

export interface CheckboxState {
  disabled: boolean;
  accessibilityLabel: string;
}

/**
 * Checkbox rules: on the editable day (today) a completed item can be tapped
 * to un-complete; future items are always disabled; past completed items are
 * read-only.
 */
export function getCheckboxState({
  isCompleted,
  itemStatus,
  isEditableDay,
}: {
  isCompleted: boolean;
  itemStatus: ItemDisplayStatus;
  isEditableDay: boolean;
}): CheckboxState {
  if (itemStatus === 'future') {
    return { disabled: true, accessibilityLabel: '미래 일정 (비활성화)' };
  }
  if (isCompleted) {
    return isEditableDay
      ? { disabled: false, accessibilityLabel: '완료 취소' }
      : { disabled: true, accessibilityLabel: '완료됨' };
  }
  return { disabled: false, accessibilityLabel: '완료 표시' };
}
