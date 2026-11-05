# W2 seed pack (2026-11-06 – 2026-11-08)

Docs only. No product TypeScript changes. This pack loads a known AsyncStorage state so the iPhone SE 3 simulator can walk PRs #15–#23. It does not add product behavior, and it does not talk to the store.

| | |
| --- | --- |
| Simulator | iPhone SE (3rd generation), UDID `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E` only |
| Never | iPhone 17 simulator `6EB78120` |
| App | `com.dailyschedule.app` |
| Clock | Mac timezone **Asia/Seoul** (the simulator clock is the Mac clock) |
| Tip storage | `@react-native-async-storage/async-storage` **2.2.0** |

The checklist is [CHECKLIST.md](./CHECKLIST.md). Feature attaches simulator proof separately; this pack does not contain screenshots.

## Apply

From the repo root, on the Mac that hosts the SE simulator:

```sh
./docs/device-week-w2/apply-seed.sh            # three promises, test unlock
./docs/device-week-w2/apply-seed.sh single     # one promise, free slot
./docs/device-week-w2/apply-seed.sh --print    # pass lines only; no simulator
./docs/device-week-w2/apply-seed.sh --check    # round-trip both profiles; no simulator
./docs/device-week-w2/apply-seed.sh --show     # read weekly keys back off the SE simulator
```

What the apply command does:

1. Refuses any argument that mentions `6EB78120`.
2. Boots `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E` if it is not already booted. It never boots another simulator. `simctl` rejects the short prefix `A3FB3EC7`.
3. Terminates `com.dailyschedule.app` and waits 2 seconds so a dying process cannot write over the seed.
4. Resolves that simulator's data container and **replaces** the AsyncStorage directory below. This wipes whatever that app had stored on this simulator, including a PIN.
5. Launches `com.dailyschedule.app` on `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E`.

The Mac must be UTC+9. If it is not, the script stops. `--allow-tz` follows the Mac's local date instead; the Friday sample strings in the checklist then may not match, and the script's printed summary is the pass text.

`--today YYYY-MM-DD` forces the calendar day (still use Seoul on the Mac, or the app's "today" will differ from the seed).

## Where the bytes go

Live directory for this tip (async-storage 2.2.0):

```text
<container>/Library/Application Support/com.dailyschedule.app/RCTAsyncLocalStorage_V1/manifest.json
```

`<container>` is `xcrun simctl get_app_container A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E com.dailyschedule.app data`.

`manifest.json` is a JSON object. Every value is a **string**. AsyncStorage never stores a bare number or array in that file. A value longer than **1024 UTF-16 code units** is `null` in the manifest, and the raw string (not a second JSON encoding) is a sibling file whose name is MD5 of the UTF-8 key. Schedules cross that line, so `@daily_schedule_schedules` is a sibling file. The script does this; do not paste the logical JSON straight into the manifest.

This is not `Documents/RNCAsyncLocalStorage_V1` or `Documents/RCTAsyncLocalStorage`. Those are pre-migration folders. Once `Application Support/.../RCTAsyncLocalStorage_V1` exists, launch keeps it. Writing only the old Documents path does not load.

## Dates

Weeks are Monday–Sunday, same as `getWeekDatesInWeek`. The script fills dates from the Mac's Seoul calendar, so the pack still works after 2026-11-08.

If you apply during the device week (Seoul):

| Today | This week | Past finished week |
| --- | --- | --- |
| Fri 2026-11-06 | Mon 2026-11-02 – Sun 2026-11-08 | Mon 2026-10-26 – Sun 2026-11-01 |
| Sat 2026-11-07 | same | same |
| Sun 2026-11-08 | same | same |

Past week, every profile: Mon–Wed fully done, Thu one open item, Fri one done and one open, Sat–Sun no items. That is 3 fully-done days out of 5 counted days (60%). This week, every day before today has one open item, so the kept-day count stays 0 until today is finished. Today is 숙제하기 done and 책 읽기 still open (1/2).

`./docs/device-week-w2/apply-seed.sh --print` prints the card lines, the result-modal lines, and the notification ids for the day you actually apply.

## Keys (tip names, not invented)

| Key | What the seed writes |
| --- | --- |
| `@iharu.schemaVersion` | string `5` (`CURRENT_SCHEMA_VERSION`) |
| `@iharu.weeklyPromise` | string `null` (v5 leaves the legacy key as JSON null) |
| `@iharu.weeklyPromises` | `WeeklyPromise[]`. One term, `effectiveFrom` = last Monday, `endsFrom` null, `kind` `"weekly"` |
| `@iharu.weeklyResults` | `WeeklyResult[]`. Id is `promiseId:weekStart`. `seenAt` null so the result modal shows once |
| `@daily_schedule_schedules` | `Schedule[]` with `dateKind: "local"` and the activity embedded on each item (the row hides if `activity` is missing) |
| `@daily_schedule_activities` | `[]` (the eight defaults stay in memory: `default-0` 숙제하기, `default-1` 책 읽기) |
| `@daily_schedule_deleted_defaults` | `[]` |
| `@daily_schedule_notifications` | `{}` |
| `@iharu.rewardExpansion` | multi: `{unlocked:true, source:"test", productId:"com.dailyschedule.app.reward_expansion", unlockedAt}`. single: locked (`unlocked:false`, null source). `source:"test"` is the sim toggle, not a purchase |
| `@settings.weeklyResultNotification` | string `true` (only the string `false` turns it off) |
| `@iharu.weeklyResultNotificationState` | `{"notified":[],"pending":[]}` so the app may schedule |
| `@user_id` | `w2-seed-user` |
| `@app_version` | `1.0.0`, which is `CURRENT_VERSION` in `src/services/storage.ts` (package.json is 1.1.0; the storage constant is the one the app writes) |
| `@migrated` | string `true` |
| `@settings.notificationsEnabled` | string `true` |
| `@settings.notificationLeadMinutes` | string `5` |

Left unset on purpose:

- `@iharu.lastCelebratedDay` — missing means the first all-done moment celebrates. The app writes today's date after that.
- `@settings.pin` — missing means Settings opens with no PIN.
- `@settings.lastBackupAt` — missing means the backup row says it has never made a file.

Profiles in [seed.json](./seed.json):

- **multi** — 아이스크림 80%, 공원 가기 60%, 책 한 권 100%. Slot limit 3. Last week only 공원 가기 is achieved.
- **single** — 아이스크림 80% only. Slot limit 1. Last week is not achieved.

Notification ids the app schedules (`weekly-result:` + the Monday of that week):

- `weekly-result:<last Monday>` — unseen result. Fires about a second after launch, because Monday 08:00 of this week is already past. Copy is the result modal title plus body and footer.
- `weekly-result:<this Monday>` — this week already has to-dos. Fires next Monday at **08:00 local**. Copy is 「지난주 약속 결과가 나왔어요」 / 「앱을 열면 결과를 볼 수 있어요」.

For a Seoul Friday in the device week those Mondays are `2026-10-26` and `2026-11-02`.

## Files

- [seed.json](./seed.json) — logical seed (profiles, activities, day pattern)
- [materialize_seed.py](./materialize_seed.py) — dates, manifest, 1024-unit split
- [apply-seed.sh](./apply-seed.sh) — SE simulator `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E` only
- [CHECKLIST.md](./CHECKLIST.md) — pass/fail for #15–#23
