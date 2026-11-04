# 「보상 확장」 IAP proposal

**Proposal only.** This file does not create an App Store Connect product, does not set a price, and does not clear anything for sale. No product is claimed to exist. A Grok Bot user card is still required before any real price or SKU decision.

Option C from PR #17 (`feat/reward-expansion`, still an open PR against its own base): ads removed, one non-consumable, placeholder product id, one free weekly promise and three with the unlock. That client and the same placeholder are already on this tip.

## SKU

| | Proposal | Status |
| --- | --- | --- |
| Product ID | `com.dailyschedule.app.reward_expansion` | **Proposal: keep.** This is the placeholder already compiled in. It is not proof that App Store Connect has a product with this id |
| Type | Non-Consumable | Matches `finishTransaction({ isConsumable: false })` and a one-time unlock |
| Reference name | 보상 확장 | Internal ASC name. Proposal |
| Family Sharing | On | Proposal. A parent pays; a child may use another device in the same family. Apple asks this when the product is created. Confirm on the user card. This pack does not turn it on |
| Cleared for sale | Off until the user card and a later, deliberate ASC edit | Not done here |
| Base storefront | South Korea | Proposal, so the KRW price is the one the owner chose. Confirm on the user card |

If the user card picks a different product id, change `REWARD_EXPANSION_PRODUCT_ID` in `src/utils/rewardExpansion.ts` in that later change. The store client, the purchase request, and the restore check all use that constant. This pack leaves it as the placeholder because the tip already matches.

## What the parent is buying

Facts from this tip, not store copy that has been submitted:

| | |
| --- | --- |
| Free | 1 weekly promise (`REWARD_SLOTS.free`) |
| Unlocked | 3 weekly promises (`REWARD_SLOTS.expanded`) |
| Sheet title | 보상 확장 |
| Intro | 「한 번 구매하면 보상 칸을 더 쓸 수 있어요. 광고나 정기 결제는 없어요.」 |
| Price line before the store returns one | 「가격은 스토어에서 확인해요」 |
| Missing product | 구매하기 returns unavailable and the sheet says 「지금은 구매할 수 없어요」 |
| Where it sits | 설정 → 보상 약속 → 보상 확장. Settings can be behind an optional 4-digit PIN. A fresh install has no PIN |

Display name and description below are draft strings for the product page. They are not entered in App Store Connect.

| Locale | Display name (30) | Description |
| --- | --- | --- |
| Korean | 보상 확장 | 주간 약속을 3개까지 만들 수 있어요. 한 번만 결제하고, 광고나 정기 결제는 없어요. |
| English (optional) | Reward expansion | Unlocks up to 3 weekly reward promises. One-time purchase. No ads and no subscription. |

Review screenshot for the product, when one is eventually required: checklist frame 6 (locked sheet). Do not upload it from this pack.

## Price options (KRW, one-time)

Three customer prices a parent would see on the South Korea storefront. They are published Apple KRW price points (Galva's table of that schedule, last verified 2026-05-13): ₩2,200 is the point listed next to USD $2.19, ₩4,400 next to $3.99, ₩6,600 next to $5.79. Confirm the point still exists in App Store Connect before anyone selects it. This pack does not open App Store Connect, and it does not treat those USD figures as the price to charge outside Korea.

Proceeds are Apple's current cut on that schedule. They are not calculated here and they are not a reason to pick a tier by themselves.

No subscription price is proposed. The code sells a non-consumable. A subscription would be a different product.

Price rows are numbered so they are not confused with option C, which is the product shape from PR #17.

| Price | Customer price (Korea) | Why it is on the list | Proposal role |
| --- | --- | --- | --- |
| 1 | **₩2,200** | Low one-time price for two extra promise slots (1 free → 3). Easy for a parent to approve. Little room later if this stays the only paid feature, because a non-consumable price change does not re-charge people who already bought it | Alternate |
| 2 | **₩4,400** | The familiar ₩4,400 point, under ₩5,000. Matches 「한 번만 결제하고 계속 써요」 for a small family unlock without looking like a tip | **Default in this proposal** |
| 3 | **₩6,600** | Still a one-time impulse, closer to a small paid app. Fits if the owner wants this unlock to carry more of the app's value. A parent who only wanted a second promise is more likely to skip it | Alternate |

**Nothing above is selected.** Price 2 is the default written in this proposal so the user card has one number to accept or replace. Do not enter it in App Store Connect until that card says so.

## Wiring check against this proposal

| Proposal item | Tip | Match |
| --- | --- | --- |
| Product id `com.dailyschedule.app.reward_expansion` | `REWARD_EXPANSION_PRODUCT_ID` in `src/utils/rewardExpansion.ts`, used by `src/services/iap.ts` | Match |
| Non-consumable | `finishTransaction` `isConsumable: false`. `requestPurchase` type `in-app` | Match |
| One product | A single default id. No second SKU in source | Match |
| Price not hardcoded | `getPrice()` returns store `displayPrice`, or null. The sheet then shows 「가격은 스토어에서 확인해요」 | Match. The app will show whichever price the store returns after a product exists |
| Unlock flag `@iharu.rewardExpansion` | `src/services/storageKeys.ts`. Purchase commits `source: "store"`. Restore commits `source: "restore"` | Match |
| Test unlock is not a purchase | `source: "test"` only from the dev toggle. W2 seed uses that source on purpose | Match. Do not ship `EXPO_PUBLIC_IAP_TEST=1` |
| ASC product record | Not in the repo | Expected gap. Do not describe this id as a live product |

No source edit. The placeholder and the proposal are the same string.
