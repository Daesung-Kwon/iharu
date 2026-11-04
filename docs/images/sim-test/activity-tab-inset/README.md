# Activity tab bar inset (iPhone SE)

Device: iPhone SE (3rd generation), 375×667 points / 750×1334, simulator `A3FB3EC7`.

PNGs are not in this commit. A later Mac SE pass adds them here. Launch with `-initialTab activity` and scroll the grid to the end before the after shot.

- `before-activity-tab.png` — 활동, scroll at the end. The last cards (그림 그리기 / 음악 연습, and the row below) sit under the translucent tab bar. Same failure as `docs/store-week-w3/shots/se/w3-se-03-activity.png` at rest.
- `after-activity-tab.png` — same screen, scrolled to the end. The last card row is fully above the tab bar, with a gap under it. The active pill stays solid `#FF6B6B` with a white icon. Hit targets stay at least 44pt.

Korean copy is unchanged. Today and Plan are unchanged: their lists already clear the bar when scrolled to the end.
