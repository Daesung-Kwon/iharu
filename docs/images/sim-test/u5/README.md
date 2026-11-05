# U-5 — Activity tab bottom inset (SE)

Device: iPhone SE sim `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E`, 750×1334, headless.
Launch: `-initialTab activity -suppressWeeklyResult 1`. Release `i.app` + Hermes `main.jsbundle` from this branch.

- `before-activity.png` — tip #29: bottom cards (그림 그리기 / 음악 연습) render under the tab bar pill.
- `after-activity.png` — #30: list ends above tab bar (`getActivityListBottomInset`); no card content under the bar; U-4 solid #FF6B6B 활동 pill + white icon kept.
