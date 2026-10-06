import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCheckboxState,
  getUndoStatus,
  planToggleComplete,
  type CompletionItem,
} from './completionLogic';

const day = (...statuses: CompletionItem['status'][]): CompletionItem[] =>
  statuses.map((status, i) => ({ id: `i${i}`, status }));

describe('planToggleComplete', () => {
  it('returns null for an unknown item', () => {
    assert.equal(planToggleComplete(day('planned'), 'nope', 'button'), null);
  });

  it('button on a non-last item completes with clap, no toast, no celebration', () => {
    const plan = planToggleComplete(day('planned', 'planned'), 'i0', 'button')!;
    assert.equal(plan.nextStatus, 'completed');
    assert.equal(plan.completedNow, true);
    assert.equal(plan.haptic, true);
    assert.equal(plan.clap, true);
    assert.equal(plan.undoToast, false);
    assert.equal(plan.celebrate, false);
  });

  it('swipe on a non-last item shows undo toast, not clap', () => {
    const plan = planToggleComplete(day('planned', 'planned'), 'i0', 'swipe')!;
    assert.equal(plan.undoToast, true);
    assert.equal(plan.clap, false);
    assert.equal(plan.celebrate, false);
  });

  it('last item celebrates the same way for swipe and button (no clap, no toast)', () => {
    const items = day('completed', 'planned', 'completed');
    const viaSwipe = planToggleComplete(items, 'i1', 'swipe')!;
    const viaButton = planToggleComplete(items, 'i1', 'button')!;
    for (const plan of [viaSwipe, viaButton]) {
      assert.equal(plan.completesDay, true);
      assert.equal(plan.celebrate, true);
      assert.equal(plan.clap, false);
      assert.equal(plan.undoToast, false);
      assert.equal(plan.haptic, true);
    }
  });

  it('single-item day celebrates on first completion', () => {
    const plan = planToggleComplete(day('planned'), 'i0', 'swipe')!;
    assert.equal(plan.celebrate, true);
  });

  it('un-completing a completed item plans it back without any feedback', () => {
    const plan = planToggleComplete(day('completed', 'completed'), 'i0', 'button')!;
    assert.equal(plan.nextStatus, 'planned');
    assert.equal(plan.completedNow, false);
    assert.equal(plan.completesDay, false);
    assert.equal(plan.haptic, false);
    assert.equal(plan.clap, false);
    assert.equal(plan.undoToast, false);
    assert.equal(plan.celebrate, false);
  });

  it('skipped items count as not completed for the last-item check', () => {
    const plan = planToggleComplete(day('skipped', 'planned'), 'i1', 'button')!;
    assert.equal(plan.completesDay, false);
    assert.equal(plan.clap, true);
  });
});

describe('getUndoStatus (swipe-undo regression)', () => {
  it('restores the pre-swipe status even if evaluated against stale state', () => {
    // Plan computed from the pre-swipe render: item was planned.
    const plan = planToggleComplete(day('planned', 'planned'), 'i0', 'swipe')!;
    // The old bug re-ran the toggle against the same stale snapshot, which
    // produced "completed" again. Undo must write the explicit prior status.
    assert.equal(getUndoStatus(plan), 'planned');
    assert.notEqual(getUndoStatus(plan), plan.nextStatus);
  });

  it('keeps a skipped item skipped after undo', () => {
    const plan = planToggleComplete(day('skipped', 'planned'), 'i0', 'swipe')!;
    assert.equal(plan.nextStatus, 'completed');
    assert.equal(getUndoStatus(plan), 'skipped');
  });

  it('is idempotent: applying undo twice still yields the prior status', () => {
    const plan = planToggleComplete(day('in_progress', 'planned'), 'i0', 'swipe')!;
    assert.equal(getUndoStatus(plan), 'in_progress');
    assert.equal(getUndoStatus(plan), 'in_progress');
  });
});

describe('getCheckboxState', () => {
  it('lets a completed item on today be un-completed with an accurate label', () => {
    assert.deepEqual(
      getCheckboxState({ isCompleted: true, itemStatus: 'completed', isEditableDay: true }),
      { disabled: false, accessibilityLabel: '완료 취소' },
    );
  });

  it('keeps past completed items read-only', () => {
    assert.deepEqual(
      getCheckboxState({ isCompleted: true, itemStatus: 'completed', isEditableDay: false }),
      { disabled: true, accessibilityLabel: '완료됨' },
    );
  });

  it('always disables future items', () => {
    assert.equal(
      getCheckboxState({ isCompleted: false, itemStatus: 'future', isEditableDay: false }).disabled,
      true,
    );
    assert.equal(
      getCheckboxState({ isCompleted: false, itemStatus: 'future', isEditableDay: true }).disabled,
      true,
    );
  });

  it('enables not-yet-completed today items', () => {
    for (const itemStatus of ['upcoming', 'current', 'missed'] as const) {
      assert.deepEqual(
        getCheckboxState({ isCompleted: false, itemStatus, isEditableDay: true }),
        { disabled: false, accessibilityLabel: '완료 표시' },
      );
    }
  });
});
