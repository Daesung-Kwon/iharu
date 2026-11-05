# U-4 screenshots (iPhone SE)

Device: iPhone SE (3rd generation), simulator `A3FB3EC7`.

Expected (binaries not in this commit):

- `before-tab-bar.png` — Today, 오늘 selected. Active icon pill is a faint coral wash on the white bar.
- `after-tab-bar.png` — same screen. Selected pill is solid coral (`#FF6B6B`) with a white icon. Inactive tabs stay gray. Labels 오늘 / 계획 / 활동 / 설정 stay on one line.

Portrait, no launch argument. The same four labels must also fit a ~320pt-wide bar (four 80pt slots) without clipping.
