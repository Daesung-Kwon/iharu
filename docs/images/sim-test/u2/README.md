# U-2 screenshots (iPhone SE, 375×667)

Device: iPhone SE (3rd generation), simulator `A3FB3EC7`.

Expected (not in git — capture on the Mac SE after this draft):

- `before-plan-empty.png` — Plan phone empty, old single line 「이날은 아직 일정이 없어요」
- `after-plan-empty.png` — Plan phone empty: 「아직 일정이 없어요」 / 「활동을 추가해 보세요」 (CTA 「첫 활동 추가」 unchanged). Past day: 「일정이 없었어요」 / 「지난 날은 바꿀 수 없어요」
- `before-activity-empty.png` — Activity empty, old line 「새 활동을 추가해서 시작해보세요!」
- `after-activity-empty.png` — Activity empty: 「활동이 없어요」 / 「활동을 추가해 보세요」

## Headless tab switch (launch argument)

`simctl openurl` raises the iOS “Open in i하루?” dialog, which cannot be tapped without Simulator.app. Launch the app with `-initialTab` instead. iOS puts that pair in the NSUserDefaults argument domain, and React Native `Settings` (already in the installed binary) exposes it. The same queue as the deep link selects the tab under the splash (~2.5s); the screen you see after the splash is that tab.

No native rebuild. Reload this JS bundle (Metro / dev client). A release build whose JS is baked in needs a new install of this JS; `Info.plist` and AppDelegate stay unchanged.

```sh
xcrun simctl launch --terminate-running-process A3FB3EC7 com.dailyschedule.app -initialTab plan
xcrun simctl launch --terminate-running-process A3FB3EC7 com.dailyschedule.app -initialTab activity
```

`--terminate-running-process` matters: a process that is already running does not receive new arguments. Values are `plan` and `activity` only.

`simctl openurl` still routes the same tabs, but the confirm dialog blocks a headless run:

```sh
xcrun simctl openurl A3FB3EC7 "com.dailyschedule.app://plan"
xcrun simctl openurl A3FB3EC7 "com.dailyschedule.app://activity"
```

`iharu://plan` and `iharu://activity` are the same URL route after a native rebuild that includes the `iharu` scheme. Path form is equivalent (`iharu:///plan`). Other URLs and other `-initialTab` values are ignored.
