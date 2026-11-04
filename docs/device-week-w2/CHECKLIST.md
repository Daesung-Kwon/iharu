# W2 device checklist

iPhone SE (3rd generation), simulator **`A3FB3EC7`**, app **`com.dailyschedule.app`**. Do not use iPhone 17 `6EB78120`. Mac timezone Asia/Seoul. No store purchase. Apply steps are in [README.md](./README.md).

Pass lines below are for **today = Friday 2026-11-06**. On another Seoul day, treat the JSON from `./docs/device-week-w2/apply-seed.sh --print` as the pass text (`cardTitle`, `cardDetail`, `modal`, `notificationIds`). The shapes do not change: last week stays 3/5 at 60%, today starts at 1/2, this week's kept-day count starts at 0.

Mark each step pass or fail. Screenshots are not part of this pack.

## 0. No-seed smoke (#21 sheet, #22 empty voice)

Do this **before** applying the seed (fresh container, or any state with no schedules).

| # | Step | Pass |
| --- | --- | --- |
| 22 | Today, today selected, no to-dos | 「오늘 할 일이 없어요」 and 「일정을 만들어 보세요」 |
| 22 | Plan, today or a future day, no items | 「아직 일정이 없어요」 and 「활동을 추가해 보세요」. CTA 「첫 활동 추가」 can stay |
| 22 | Plan, a past day with no items | 「일정이 없었어요」 and 「지난 날은 바꿀 수 없어요」 |
| 22 | Activity | Not empty. Eight default activities still show. 「활동이 없어요」 / 「활동을 추가해 보세요」 only after every activity is deleted. That delete is optional and is not part of the seed |
| 21 | Plan, phone, tap 추가 (or 첫 활동 추가) | Bottom sheet: dim scrim, white card, large top corners, round close, **no drag handle** |

## 1. Apply multi

```sh
./docs/device-week-w2/apply-seed.sh
```

Pass: the printed JSON has `"profile": "multi"`, the app launches on `A3FB3EC7`, and Settings opens with **no PIN**. If Today still shows the old data, the previous process wrote after the seed; run the script again (it terminates first).

Allow the notification prompt when it appears. If iOS already denied it, Settings → 결과 알림 shows 「알림 권한이 없어 보내지 못해요」 and the ids in section 6 will not stick until notification permission is granted.

## 2. #16 / #20 result moment (multi)

On launch, before you finish today, a modal (not the celebration):

| | Pass (2026-11-06, multi) |
| --- | --- |
| Title | 지난주 약속을 지켰어요! |
| Body | 5일 중 3일 다 끝냈어요 (60%) |
| Footer | 약속한 보상: 공원 가기 |

Tap 확인. It does not come back on this launch. Re-apply the seed to see it again.

Today header, under the week strip:

| | Pass |
| --- | --- |
| Title | 이번 주 약속 3개 |
| Detail | 4일 중 0일 다 끝냈어요 (목표 닿음 0/3) |

Settings → 보상 약속 → 주간 약속: row 「약속 3개」, note 「이번 주: 4일 중 0일 다 끝냈어요」.

## 3. #23 soft week strip

With the multi seed, before today is finished:

| Where | Pass |
| --- | --- |
| This week (contains today) | 「이번 주 아직이에요」. Every day before today is a partial dot (one open item). Today is partial too, because it is 1/2. Later days this week are empty |
| One week back (chevron) | 「3일 지켰어요」 (no 「이번 주」). Three kept days, two partial, two empty |
| Two weeks back, if the arrow is enabled | 「아직이에요」 |

After section 4 finishes today, this week becomes 「이번 주 1일 지켰어요」.

## 4. #15 instant reward

Today shows 숙제하기 completed and 책 읽기 open. SE progress row: 「진행 상황」, **1/2**, **50%**.

1. Tap the 숙제하기 checkbox to clear it. Bar goes to 0/2. No haptic on the clear.
2. Tap 숙제하기 again. The checkbox pops (scale). The bar glides to 50% (about a third of a second; Reduce Motion jumps). Light haptic if the simulator plays it. No modal.
3. Tap 책 읽기. Bar glides to **2/2, 100%** and the fill takes the perfect color. Success haptic if the simulator plays it. About 300ms later the celebration: 「🎉 완벽해요! 🎉」, 「오늘의 모든 일정을 완료했어요!」, 「정말 수고했어요! 내일도 화이팅! 💪」. Reduce Motion fades this in with no spin.
4. Close it. Clear one item, then complete the day again. Toast 「오늘 할 일을 다 끝냈어요」. The celebration does **not** open a second time today.

Simulator haptics are often silent. A silent sim passes on the checkbox pop, the bar, and the once-a-day modal. Note haptic as a later device check, not a sim failure.

Swipe of a non-last item also passes if it toasts 「완료했어요」 with 취소, and 취소 restores that item. The last item celebrates instead of showing that toast.

## 5. #19 slots and #16 settings sheet (multi)

Settings → 보상 약속.

| Row | Pass |
| --- | --- |
| 주간 약속 | Opens a list (not a form). Three rows: 아이스크림 (목표 80%), 공원 가기 (목표 60%), 책 한 권 (목표 100%). Footer 「약속 3개 / 3개」. No 「약속 더하기」 |
| 결과 알림 | On. Subtitle 「한 주가 끝나면 알려 드려요」 |
| 보상 확장 | 「보상 칸 3개까지 쓸 수 있어요 (테스트)」 |

Do not tap 구매하기 or 구매 복원. Do not flip 「테스트: 확장 끄기」 during this pass.

## 6. #20 notification ids

After the multi launch, with notification permission granted, Metro (or the dev log) shows both:

- `주간 결과 알림 예약: weekly-result:2026-10-26` (or the last Monday the script printed)
- `주간 결과 알림 예약: weekly-result:2026-11-02` (or the this-week Monday the script printed)

Then quit the app and run `./docs/device-week-w2/apply-seed.sh --show`. Pass when `@iharu.weeklyResultNotificationState` has last Monday in `notified` and this Monday in `pending`. `pending.fireAt` is next Monday **08:00 in the simulator timezone**.

The past-week notification is the result copy and is due immediately (the app schedules it about one second out). The this-week notification uses 「지난주 약속 결과가 나왔어요」 / 「앱을 열면 결과를 볼 수 있어요」. A missing banner on the simulator is not a fail when the log or `--show` has both ids. A real device can confirm the banner later.

If permission was denied, `--show` will not list those weeks. That is a permission fail, not a seed fail.

## 7. #21 sheet chrome (with the seed)

On SE, open all three and compare. Pass when they share one chrome: dim scrim (not a blur), white sheet, large top corners, round 닫기, no drag handle.

| Sheet | How |
| --- | --- |
| 주간 보상 약속 | Settings → 주간 약속 |
| 보상 확장 | Settings → 보상 확장. Leave it. Do not buy |
| Plan 추가 | Plan tab → 추가 |

## 8. #18 기기 옮기기

Settings, scroll to the bottom. Section 「기기 옮기기」.

| Step | Pass |
| --- | --- |
| 백업 파일 만들기, before tapping | Subtitle 「아직 백업하지 않았어요」 |
| Tap it | The iOS share sheet opens |
| Close the share sheet | Toast 「백업 파일을 만들었어요. 저장할 곳을 골랐다면 완료예요」. Subtitle becomes 「마지막 백업 파일 만든 날: M/D HH:MM」 |
| 백업 파일 불러오기 | The document picker opens. Cancel it. Do not import another file over this seed |
| 데이터 초기화 | Alert 「백업 파일을 먼저 만들까요?」 with 취소, 백업 먼저, 바로 초기화. Tap **취소**. Fail if the data is wiped |

## 9. #16 single promise

```sh
./docs/device-week-w2/apply-seed.sh single
```

Dismiss the result modal. Pass:

| | |
| --- | --- |
| Modal title | 지난주 결과예요 |
| Modal footer | 목표 80%에는 닿지 못했어요. 이번 주에 다시 해 봐요! |
| Today card | 「이번 주 약속: 아이스크림」 and 「4일 중 0일 다 끝냈어요 (목표 80%)」 (or the printed `cardDetail`) |
| Settings row | 「아이스크림 (목표 80%)」 |
| 보상 확장 | 「주간 약속 1개 (무료)」 |
| 주간 약속 sheet | Opens the form directly (one slot). Link 「보상 확장으로 약속을 더 만들 수 있어요」. Do not buy. Do not save a second reward |

## 10. #15 midnight, last

Stay on Today, viewing today. Turn off automatic date and time and move the Mac clock across local midnight (the simulator follows the Mac). Pass:

- A celebration that was open closes.
- The selected day follows to the new today (it was showing the old today).
- The new today has no seeded items: 「오늘 할 일이 없어요」 / 「일정을 만들어 보세요」.

Turn automatic date and time back on. Re-apply the seed before any other check; the calendar day has moved.

## Out of scope

No purchase, no restore-from-store, no reset confirmation, no second simulator, no edit to product code for this pass.
