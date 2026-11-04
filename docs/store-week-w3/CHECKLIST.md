# W3 App Store checklist

1차 App Store. Deadline **2026-11-20** Asia/Seoul. Fill this offline. Do not create products, set prices, upload a build, or submit a review from this pack.

App: **i하루**. Bundle **`com.dailyschedule.app`**. Version string in `app.json`: **1.1.0**. iOS build number in `app.json`: **8**. Primary copy language for the shots below: Korean. The owner still chooses the App Store primary language.

Mark each row pass or fail when the owner has the value, not when it has been typed into App Store Connect.

## 0. Rules for this pass

| # | Rule | Pass |
| --- | --- | --- |
| 0.1 | No App Store Connect writes | No app record edit, no in-app product, no price, no screenshot upload, no submit |
| 0.2 | No payment | Do not tap 구매하기 on a build that can reach the store. Do not use a sandbox account for this pack |
| 0.3 | No real device | Shots, when they are taken later, come from simulators |
| 0.4 | Forbidden simulator | Do not boot iPhone 17 `6EB78120` |
| 0.5 | SE, if a later pass needs it | iPhone SE (3rd generation) `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E` only. `simctl` rejects the short prefix `A3FB3EC7` |
| 0.6 | This pack | Docs only. SE was not required. See the audit in [README.md](./README.md) |

## 1. ASC metadata

Limits are Apple's field limits. `TODO` means the owner chooses the value. Do not invent a contact, a copyright line, or a support URL.

### 1.1 App information

| Field | Limit | Value for this app | Status |
| --- | --- | --- | --- |
| Name | 30 | `i하루` is the name in `app.json` and `CFBundleDisplayName`. A longer store name is optional. Example already in the old guide, not chosen: 「i하루 - 하루 일과표」 | TODO confirm the store name |
| Subtitle | 30 | TODO | TODO |
| Bundle ID | — | `com.dailyschedule.app` | Filled by the binary. Do not mint another id |
| SKU | — | TODO. This is the App Store Connect app SKU, not the in-app product id | TODO |
| Primary language | — | TODO. Korean matches the UI | TODO |
| Primary category | — | TODO. Candidates to choose from, not a selection: Education, Lifestyle | TODO |
| Secondary category | — | TODO or none | TODO |
| Content rights | — | TODO. The app does not appear to ship third-party media that needs a rights claim. Owner confirms | TODO |
| Age rating | questionnaire | TODO. Finish the questionnaire. Do not type a rating here. Notes in section 3 | TODO |
| License agreement | — | Apple standard, unless the owner has a custom one | TODO confirm |

### 1.2 Version page (1.1.0)

| Field | Limit | Value | Status |
| --- | --- | --- | --- |
| What's New | 4000 | TODO. 1차 can say this is the first iPhone + iPad release, only if that is true of the record that already exists. This pack does not look up the live record | TODO |
| Promotional text | 170 | TODO or leave empty. This can change without a review | TODO |
| Description | 4000 | TODO. The draft in `docs/APP_STORE_LAUNCH_GUIDE.md` section 7.3 is a starting point. It does not mention 보상 확장. Add the one-time unlock only after the user card picks a price | TODO |
| Keywords | 100 | TODO. Comma-separated, no space after the comma. The old example `일정관리,일과표,스케줄,아이,아동,태블릿,계획,타임라인` is 39 characters and is not a decision | TODO |
| Support URL | required | TODO. Must be a public `https` page the owner controls | TODO |
| Marketing URL | optional | Leave empty. Ads are removed. Do not use `https://daesung-kwon.github.io/iharu/` or `app-ads.txt` as a marketing URL. `docs/app-ads.txt` is removed from the repo. The live `app-ads.txt` URL stays up until the owner publishes `main` `/docs` | TODO or blank |
| Copyright | — | TODO. Year and the owner's name. Do not copy a placeholder | TODO |
| Version | — | `1.1.0` from `app.json` | Confirm on the uploaded build. See section 4 |
| Routing app coverage | — | Not a routing app. Leave unset | Pass as N/A |

### 1.3 App Review information

| Field | Value | Status |
| --- | --- | --- |
| Sign-in required | No account. A fresh install has no settings PIN, so 설정 opens | Pass as "no demo account", unless the review build has a PIN |
| Demo PIN | TODO. Write it here only if that build has `@settings.pin` set | TODO |
| Contact first name | TODO | TODO |
| Contact last name | TODO | TODO |
| Contact phone | TODO | TODO |
| Contact email | TODO | TODO |
| Notes | Draft below. Owner edits before anyone pastes it | TODO |
| Attachment | Optional. Not part of this pack | — |

Review notes draft (not submitted):

```text
i하루 is a family daily-schedule app. There is no account. Schedules stay on the device.

Settings can be locked with an optional 4-digit PIN. A fresh install has no PIN, so Settings opens directly. Demo PIN: TODO.

One in-app product is planned: non-consumable "보상 확장" (product id com.dailyschedule.app.reward_expansion). It unlocks 3 weekly reward promises instead of 1. It is not created in App Store Connect yet. Until it exists, Settings → 보상 확장 → 구매하기 shows "지금은 구매할 수 없어요". That is the expected missing-product state, not a broken purchase. No sandbox account is required to review the rest of the app.

The app does not show ads and does not request IDFA or tracking.
```

Replace the "not created yet" sentences after a product actually exists. Do not claim it exists before that.

## 2. Screenshot shot list

Portrait only. 1 to 10 images per slot. `.png`, `.jpg`, or `.jpeg`. No alpha channel. Status bar stays in frame. Korean UI. Do not scale an SE shot into the taller slot: 750×1334 is a different aspect from 1179×2556 and 1206×2622.

Apple's page (checked 2026-11-04) says the required iPhone set is **one screenshot for iPhone with Dynamic Island (medium display)**. If the app runs on iPad, a **13-inch iPad** set is also required. This binary does (`app.json` `deviceFamily`: iPhone and iPad). Smaller iPhone slots, including SE, are optional. App Store Connect scales a provided set down. SE is still on this list because this app is laid out for that phone, and a scaled tall-phone shot is a poor picture of the SE layout.

Take the same six frames in each slot. Frame 1 is the product-page hero.

| # | Screen | How | What "pass" shows |
| --- | --- | --- | --- |
| 1 | Today / 오늘 | Tab 오늘 | A day that has items, the progress row, and the week strip. Not the empty line 「오늘 할 일이 없어요」 as the only hero |
| 2 | Plan / 계획 | Tab 계획 | A day that has items. Not 「아직 일정이 없어요」 |
| 3 | Activity / 활동 | Tab 활동 | The activity list, including the defaults (숙제하기, 책 읽기) |
| 4 | Settings / 설정 | Tab 설정 | Section 보상 약속, with rows 주간 약속, 결과 알림, and 보상 확장. Unlock the PIN first if one is set |
| 5 | Reward promise | 설정 → 주간 약속 | The promise sheet (the form when there is one slot, or the list when there are more). Do not buy. Do not need to save |
| 6 | 보상 확장 | 설정 → 보상 확장 | Locked sheet: 구매하기, and 「가격은 스토어에서 확인해요」. Do not tap 구매하기. Do not show a receipt |

Optional seventh frame, not a store receipt: the same sheet with the dev toggle on, subtitle ending in 「(테스트)」. Label the file so it is not uploaded as proof of a purchase. The store binary hides that toggle (`__DEV__` or `EXPO_PUBLIC_IAP_TEST=1` only).

### 2.1 iPhone SE (layout set, optional in App Store Connect)

| | |
| --- | --- |
| Apple slot | iPhone with Home Button (medium display) |
| Devices Apple lists | iPhone SE (3rd generation), iPhone SE (2nd generation), iPhone 8, iPhone 7, iPhone 6s, iPhone 6 |
| Portrait size | **750 × 1334** pixels |
| Capture | iPhone SE (3rd generation) simulator. UDID `A3FB3EC7-70FA-41E0-8BAF-CF7C0D33E19E` when this repo's SE is used. Points are 375×667; upload the pixel size, not a 375-wide image |
| Required by Apple | No. Scaled shots are used if this slot is empty |
| Required by this pack's shot list | Yes, as the compact-phone set. Not taken in this pack |

### 2.2 Larger iPhone (required by Apple)

| | |
| --- | --- |
| Apple slot | iPhone with Dynamic Island (medium display). This is the required iPhone slot |
| Devices Apple lists | iPhone 18 Pro, iPhone 17 Pro, iPhone 17, iPhone 16 Pro, iPhone 16, iPhone 15 Pro, iPhone 15, iPhone 14 Pro |
| Portrait sizes Apple accepts | **1179 × 2556** or **1206 × 2622** |
| Capture | One simulator in that list whose native pixels are one of those two sizes. iPhone 16 Pro exports at 1206×2622. iPhone 14 Pro, iPhone 15, and iPhone 15 Pro export at 1179×2556. Do not use iPhone 17 simulator `6EB78120` |
| Do not upload into this slot | 1320×2868, 1290×2796, 1260×2736. Those are the optional **Dynamic Island (large display)** slot (iPhone Air, iPhone 17 Pro Max, iPhone 16 Pro Max, and the other phones Apple lists there). The older docs that call 6.9-inch required are behind the page checked on 2026-11-04 |

Large-display shots are optional. Skip them for 1차 unless the owner wants a Pro Max frame.

### 2.3 iPad 13-inch (required because the app runs on iPad)

| | |
| --- | --- |
| Apple slot | iPad 13-inch display |
| Devices Apple lists | iPad Pro (M5, M4), iPad Pro (6th, 5th, 4th, 3rd, 1st generation), iPad Air (M4, M3, M2) |
| Portrait sizes Apple accepts | **2064 × 2752** or **2048 × 2732** |
| Capture | An iPad simulator in that list. iPad Pro 13-inch (M4) is 2064×2752. A 12.9-inch iPad Pro (3rd generation and later, except the separate 2nd-generation slot) is 2048×2732 |
| Phone frames | Do not upload the iPhone set here |

File names, when shots exist later: `w3-se-01-today.png` through `w3-se-06-expansion.png`, and `w3-iphone-01-today.png` through `w3-iphone-06-expansion.png`, plus `w3-ipad-01-today.png` through `w3-ipad-06-expansion.png`. This pack does not add those files.

## 3. Privacy / kids

The app is a family schedule tool. That does not by itself put it in the App Store Kids Category. The owner chooses the age-rating answers and whether to join the Kids Category. This pack does not submit either.

### 3.1 What the binary supports declaring

| Topic | Declare | Evidence on this tip |
| --- | --- | --- |
| Tracking | No | `ios/i/PrivacyInfo.xcprivacy` `NSPrivacyTracking` is false. In-app policy says the app does not request IDFA through ATT. No `NSUserTrackingUsageDescription` in the checked-in Info.plist |
| Data collected by the developer | Data Not Collected, if the questionnaire is answered from this binary | `NSPrivacyCollectedDataTypes` is an empty array. Schedules, the settings PIN, and the unlock flag stay in AsyncStorage. `src/services/iap.ts` has no server and no payment fields |
| Purchases | Do not mark Purchases as data the developer collects | The unlock is a local flag `@iharu.rewardExpansion`. Apple processes the payment. `src/data/privacy.ts` says the provider does not receive payment information |
| Advertising / AD_ID | Not used | `app.json` `android.blockedPermissions` includes `com.google.android.gms.permission.AD_ID`, `ACCESS_ADSERVICES_AD_ID`, `ACCESS_ADSERVICES_ATTRIBUTION`, `ACCESS_ADSERVICES_TOPICS`, and `BIND_GET_INSTALL_REFERRER_SERVICE`. `android/app/src/main/AndroidManifest.xml` removes each of those with `tools:node="remove"`. `src/noAds.test.ts` fails if the AD_ID remove or an ad SDK returns. No `GADApplicationIdentifier` in `ios/i/Info.plist` |
| Diagnostics, contacts, location | Not collected by the app | No such SDK in `package.json` |
| Privacy policy URL | A public page that matches the binary | In-repo text matches. `src/data/privacy.ts` and `docs/privacy.html` (시행일 2026-10-28): no ads, no IDFA, 보상 확장 payments stay with the store. **Owner TODO:** Pages builds `https://daesung-kwon.github.io/iharu/privacy.html` from `main` `/docs` only. This branch does not publish that URL. Do not paste it into App Store Connect until the live page no longer describes Google AdMob |
| Export compliance | No, non-exempt encryption | `app.json` sets `ITSAppUsesNonExemptEncryption` false. The checked-in Info.plist does not yet contain the key. See the audit |

### 3.2 Kids notes

| Topic | Note |
| --- | --- |
| Kids Category | Not selected in this pack. If the owner joins it, Apple also expects no third-party ads (already true) and a parental gate before purchases and external links |
| Parental gate today | Settings PIN is optional and off on a fresh install. 보상 확장 lives under 설정. With no PIN, a child can open 구매하기. That is acceptable to record for a 4+ family app only if the owner does not join the Kids Category. It is a gap if they do |
| Age rating answers that match the binary | No ads, no unrestricted web, no public user-generated content, no gambling. One planned non-consumable in-app purchase. The owner still has to complete Apple's questionnaire. Leave the resulting rating blank here |
| Ads copy to retire | Do not tell review, or the privacy form, that the app shows AdMob. PR #17 removed the ad SDK. In-repo `docs/privacy.html` now matches that. The live Pages copy is still an owner publish |

## 4. Store build

Do not run these commands for this pack. No upload.

Prefer **EAS**. The repo already has `eas.json`. `cli.appVersionSource` is `remote`, so the version EAS uploads can differ from a laptop's last archive. `build.production` is not a simulator build, and `autoIncrement` is true. `submit.production.ios` is `{}`. There is no Apple ID, no App Store Connect app id, and no team id in the repo. Do not add those secrets to the repo to make this checklist shorter.

```sh
# Owner's machine, after the user card. Not part of this pack.
eas login
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Before `eas submit`, confirm:

| Check | Pass |
| --- | --- |
| Profile | `production`. `ios.simulator` is false |
| `EXPO_PUBLIC_IAP_TEST` | Unset. `eas.json` does not set it. If it is `1`, the store binary shows 「테스트: 확장 켜기」 |
| Ads | The production install still has no ad SDK and still merges the AD_ID `tools:node="remove"` manifest lines |
| Encryption prompt | The uploaded Info.plist carries `ITSAppUsesNonExemptEncryption` = false, or the owner answers "No" at upload. `app.json` already says false |
| Version | The build App Store Connect shows is the 1차 version the owner intends. `app.json` says 1.1.0 (8). Remote autoincrement may raise the build number |

Xcode archive path, if EAS is not used:

| | |
| --- | --- |
| Project | `ios/i.xcodeproj` |
| Scheme | `i` |
| Bundle | `com.dailyschedule.app` |
| Info.plist version | `CFBundleShortVersionString` **1.1.0**, `CFBundleVersion` **8** (still hardcoded, so a raw archive embeds these strings) |
| Target build settings | Debug and Release `MARKETING_VERSION` **1.1.0**, `CURRENT_PROJECT_VERSION` **8**. These match `app.json` and the plist. Do not point the plist at `$(MARKETING_VERSION)` unless those settings stay on 1.1.0 / 8 |
| Archive | Product → Archive, then distribute later. Distribution is not done in this pack |
| expo-iap | The plugin is in `app.json`. A raw archive only includes it if Pods were installed for this `ios/` tree. If the archive's purchase sheet cannot load the native module, use the EAS production profile instead of patching the archive by hand |

Pass for section 4 on this pack: the steps are written, no command was run, no build was uploaded.
