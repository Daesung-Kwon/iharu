# W3 store screenshots — iPhone SE (750×1334)

- Simulator: iPhone SE `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E` (headless `simctl`), status bar 9:41 / full battery
- Pixel size: 750×1334 (raw `simctl io screenshot`, no overlays), Korean UI
- Seed: `docs/device-week-w2/apply-seed.sh single`
- Launch args from PR #27: `-initialTab today|plan|activity|settings`, `-openSheet weeklyPromise|rewardExpansion`, `-suppressWeeklyResult 1`
- 06 shows the locked expansion sheet; 구매하기 was never tapped
- Not uploaded to App Store Connect

| # | File | Screen |
|---|------|--------|
| 1 | w3-se-01-today.png | 오늘 (items, progress, week strip) |
| 2 | w3-se-02-plan.png | 계획 |
| 3 | w3-se-03-activity.png | 활동 관리 defaults |
| 4 | w3-se-04-settings-reward.png | 설정 › 보상 약속 |
| 5 | w3-se-05-weekly-promise.png | 주간 보상 약속 sheet |
| 6 | w3-se-06-expansion.png | 보상 확장 (locked) |

## Refresh 2026-11-04 (KST)
- `w3-se-03-activity.png` re-captured after U-5 Activity inset (#30), tip #31 @ `0d4a3a1`, SE A3FB3EC7, `-initialTab activity -suppressWeeklyResult 1`, seed `single`. Other 5 frames unchanged.
- U-5b refresh (`420469f`): `w3-se-03-activity.png` re-shot — Activity list now scrolls behind the translucent tab bar (U-5 lift removed).
