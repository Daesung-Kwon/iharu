# U-2 screenshots (iPhone SE, 375×667)

Device: iPhone SE (3rd generation), simulator `A3FB3EC7`.

Expected (not in git — capture on the Mac SE after this draft):

- `before-plan-empty.png` — Plan phone empty, old single line 「이날은 아직 일정이 없어요」
- `after-plan-empty.png` — Plan phone empty: 「아직 일정이 없어요」 / 「활동을 추가해 보세요」 (CTA 「첫 활동 추가」 unchanged). Past day: 「일정이 없었어요」 / 「지난 날은 바꿀 수 없어요」
- `before-activity-empty.png` — Activity empty, old line 「새 활동을 추가해서 시작해보세요!」
- `after-activity-empty.png` — Activity empty: 「활동이 없어요」 / 「활동을 추가해 보세요」

## Headless tab switch

Simulator.app GUI is not available. The app listens for a URL host or path of `plan` or `activity` and switches tabs. Wait until the splash (~2.5s) has finished, or send the URL while the app is already open.

The installed binary already registers `com.dailyschedule.app` (no rebuild):

```sh
xcrun simctl openurl A3FB3EC7 "com.dailyschedule.app://plan"
xcrun simctl openurl A3FB3EC7 "com.dailyschedule.app://activity"
```

`iharu://` is the same route. It is in `app.json` and `ios/i/Info.plist`, so it works after a native rebuild that picks up that scheme:

```sh
xcrun simctl openurl A3FB3EC7 "iharu://plan"
xcrun simctl openurl A3FB3EC7 "iharu://activity"
```

Path form is equivalent (`iharu:///plan`, `com.dailyschedule.app:///activity`). Other URLs are ignored.
