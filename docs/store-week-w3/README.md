# W3 ASC / IAP readiness pack

Docs and a price proposal only. Nothing in this pack writes to App Store Connect, creates a product, sets a price, or takes a payment.

| | |
| --- | --- |
| Deadline | **2026-11-20**, Asia/Seoul. 1차 App Store |
| Stacks on | `cursor/u4-tab-bar-contrast-f56a` @ `d06b1eb0a1428a21d2f260076d5a1a56d986790e` (draft PR #25) |
| App | i하루. Bundle `com.dailyschedule.app`. `app.json` version **1.1.0**, iOS `buildNumber` **8** |
| Product | One non-consumable, 「보상 확장」. Option C from PR #17. Details in [IAP-PROPOSAL.md](./IAP-PROPOSAL.md) |
| Checklist | [CHECKLIST.md](./CHECKLIST.md) |
| Simulator | **Not used.** The product id on this tip already matches the placeholder, so no runtime edit and no SE pass |

## In scope

- The App Store Connect fields to fill, with blanks where the owner has to choose the words.
- A portrait shot list: iPhone SE (3rd generation) plus the iPhone size Apple currently requires, and the iPad size this universal binary also requires.
- What to declare for privacy and for a family/kids-oriented app, including the ad-id blocks already in the project.
- How a store build is produced with the EAS profile or an Xcode archive this repo already has. The steps are written down. They are not run.
- A proposal for the one-time 「보상 확장」 SKU and three KRW price points.

## Out of scope

- Creating the app record, the in-app product, a price, a screenshot upload, or a review submission.
- Sandbox purchases, StoreKit configuration files, and receipts.
- A real device, and the iPhone 17 simulator `6EB78120`.
- Changing `REWARD_EXPANSION_PRODUCT_ID`. It already equals the placeholder.
- Editing the live privacy page, or Play Console (Android is mentioned only where the same binary facts matter).

## How this pack is used

1. Read [CHECKLIST.md](./CHECKLIST.md) and fill the `TODO` cells offline. Do not type them into App Store Connect as part of this pack.
2. Read [IAP-PROPOSAL.md](./IAP-PROPOSAL.md). Every price and the SKU stay a **proposal**. A Grok Bot user card is still required before any real price or SKU decision.
3. After that card, a later change may create the App Store product. If the chosen product id differs from `com.dailyschedule.app.reward_expansion`, the constant in `src/utils/rewardExpansion.ts` has to change in that later change. This pack does not change it.
4. A store build (checklist section 4) comes after the metadata and the product decision. This pack does not start one.

No App Store Connect product is claimed to exist. The sheet copy already says the price is confirmed at the store, and a missing product returns 「지금은 구매할 수 없어요」.

## Audit (this tip)

Product-id checks below are unchanged from the W3 pack: the placeholder matches PR #17, and this follow-up does not edit `REWARD_EXPANSION_PRODUCT_ID`. The privacy-page and version rows are the two gaps closed in-repo after `b3060ad`. Export compliance is still open. The live Pages site is still an owner publish.

| Check | Where | Result |
| --- | --- | --- |
| Product id string | `src/utils/rewardExpansion.ts` `REWARD_EXPANSION_PRODUCT_ID` | **Pass.** `com.dailyschedule.app.reward_expansion` |
| Same id in the seed notes | `docs/device-week-w2/README.md`, `docs/device-week-w2/seed.json` | **Pass.** Same string. `source:"test"` is the sim toggle, not a purchase |
| Store client | `src/services/iap.ts` `createStoreIap()` | **Pass.** Defaults to that id. `fetchProducts` type `in-app`. Apple `sku` and Google `skus`. `finishTransaction` with `isConsumable: false` |
| Plugin and dependency | `app.json` plugins includes `expo-iap`. `package.json` `expo-iap` `^6.3.0` | **Pass.** |
| Unlock flag | `src/services/storageKeys.ts` `@iharu.rewardExpansion`. Schema v4. Backup keeps it and will not downgrade a purchase (`mergeOnRestore`) | **Pass.** |
| Settings row | `src/screens/ProfileScreen.tsx` section 보상 약속, row title `EXPANSION_COPY.title` (`보상 확장`) | **Pass.** |
| Purchase sheet | `src/components/RewardExpansionSheet.tsx` | **Pass.** 구매하기 / 구매 복원. Price comes from the store `displayPrice`. Until then the note is 「가격은 스토어에서 확인해요」. A missing product sets 「지금은 구매할 수 없어요」 |
| What the unlock does | `REWARD_SLOTS`: free **1**, expanded **3** weekly promises | **Pass.** Copy matches (`주간 약속을 3개까지`) |
| Test toggle | `SHOW_TEST_TOGGLE = __DEV__ \|\| EXPO_PUBLIC_IAP_TEST === '1'`. `testOff` does not clear `store` or `restore` | **Pass** for a store binary if the env var is unset. `eas.json` does not set it. No `.env` file is in the repo |
| App Store product, price, StoreKit file | — | **Gap.** Not in the repo, and not created here. Fetch returns nothing until a product with this id exists for this bundle |
| Public privacy page vs the binary | `src/data/privacy.ts` and `docs/privacy.html` both say no ads, no IDFA, 보상 확장 payments stay with the store, 시행일 2026-10-28. `docs/app-ads.txt` is removed. The launch guide no longer tells the owner to paste an AdMob marketing URL | **Closed in the repo.** **Owner TODO:** GitHub Pages serves `https://daesung-kwon.github.io/iharu/` from `main` `/docs` only. This branch does not publish. Do not paste `https://daesung-kwon.github.io/iharu/privacy.html` into App Store Connect until that URL shows the no-ads page, and until `https://daesung-kwon.github.io/iharu/app-ads.txt` is no longer served |
| Version sources | `app.json` version **1.1.0**, iOS `buildNumber` **8**. `package.json` **1.1.0**. `ios/i/Info.plist` hardcodes `CFBundleShortVersionString` **1.1.0** and `CFBundleVersion` **8**. Target Debug and Release: `MARKETING_VERSION` **1.1.0**, `CURRENT_PROJECT_VERSION` **8** | **Closed.** Not bumped past 1.1.0 (8). The plist stays literal, so a raw archive embeds 1.1.0 (8), and the Xcode settings now agree. Android `versionName` is already `1.1.0`. Android `versionCode` stays **2** because `app.json` sets no `android.versionCode` |
| Export compliance key | `app.json` `ITSAppUsesNonExemptEncryption: false`. The checked-in `ios/i/Info.plist` does not contain that key | **Gap.** An EAS build from `app.json` can carry it. A raw archive of `ios/` as committed will be asked the encryption question at upload |

## Screenshot sizes (checked 2026-11-04)

Source: [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/). Apple's required iPhone slot on that page is **iPhone with Dynamic Island (medium display)**, not the 6.9-inch slot.

`docs/APP_STORE_LAUNCH_GUIDE.md` and `docs/MOBILE_EXPANSION.md` still call iPhone 6.9-inch the required slot. Follow this pack for the 1차 shot list. The shot list itself is in the checklist.

## Files

- [CHECKLIST.md](./CHECKLIST.md) — metadata, shots, privacy, build steps
- [IAP-PROPOSAL.md](./IAP-PROPOSAL.md) — SKU and KRW prices, marked proposal only
