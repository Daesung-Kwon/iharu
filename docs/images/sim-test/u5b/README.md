# U-5b — Activity scrolls behind tab bar (SE)

Device: iPhone SE sim `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E`, 750×1334, headless Release `i.app` + Hermes `main.jsbundle` from `420469f`.
Launch: `-initialTab activity -suppressWeeklyResult 1`. Mid/end scroll offsets set via a proof-only, uncommitted `-proofScroll` launch-arg patch (not in the branch).

- `before-activity-mid.png` — tip #32 (U-5): list scrollport lifted above the tab bar (`marginBottom`), hard cut, nothing behind the bar.
- `after-activity-mid.png` — U-5b: card content peeks through the translucent tab bar like Today/Plan.
- `after-activity-end.png` — U-5b: scrolled to end; last row (간식 먹기 / 낮잠 자기) fully clear above the bar via `scrollEndPadding`.
- U-4 coral 활동 pill / 44pt tab bar unchanged.
