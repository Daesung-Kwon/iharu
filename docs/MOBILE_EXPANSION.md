# 모바일 확장 전략

i하루는 **별도 스마트폰 앱을 만들지 않는다.** 기존 iPad / Android 태블릿 앱을 같은 바이너리로 유니버설하게 연다.

## 원칙

- **유니버설 바이너리**: 하나의 Expo 프로젝트, 하나의 스토어 리스팅. 두 번째 앱이 아니다.
- **패키지 ID는 유지한다.** 바꾸지 않는다.
  - iOS: `com.dailyschedule.app`
  - Android: `com.iharu.app`
- **레이아웃 게이트가 스토어 게이트보다 앞선다.** compact 레이아웃(PR 6)이 들어간 뒤에 이 PR에서 스토어 기기 제한만 해제한다.

## compact 정의

`src/constants/config.ts`의 `BREAKPOINTS.tablet`(768)과 `getLayoutMetrics()`를 따른다.

- **compact** = 짧은 변(shortest side) `< 768`
- 폰 가로(예: 844×390)도 compact로 남는다.
- iPad 세로(768×1024)는 regular(태블릿)로 남는다.

## 방향(orientation)

- **스마트폰**: 세로 우선(Portrait). 필요 시 PortraitUpsideDown.
- **iPad**: 세로/가로 4방향 모두 (`UISupportedInterfaceOrientations~ipad`).

## 스토어 게이트 (이 PR)

앱 코드는 이미 창 너비로 compact/regular를 나눈다. 이 PR은 스토어가 폰을 거절하지 않게 설정만 연다.

| 플랫폼 | 이전 | 이후 |
| --- | --- | --- |
| iOS | `deviceFamily: ["ipad"]`, `UIDeviceFamily` 2 | `["iphone", "ipad"]`, family 1+2 |
| Android | `tabletOnly: true` | 제거 (폰 + 태블릿) |
| App Store Connect | iPad만 | **iPhone 디바이스 활성화** |
| Play Console | 태블릿 form factor | **phone form factor** 포함 |

EAS 빌드 / 제출 시 `npx expo prebuild --clean`을 돌리지 않는다. `app.json`과 맞춰 `ios/i/Info.plist` 키를 손으로 유지한다.

## 심사 메모 (Review notes)

기존 iPad 앱을 유니버설로 확장하는 업데이트다. 로컬 데이터·번들 ID는 그대로다.

```
This update turns the existing iPad app into a universal iPhone + iPad binary.
It is the same app (com.dailyschedule.app), not a new listing.
All user data stays on-device; nothing is migrated or reset.
Phone layouts are compact (shortest side < 768). iPad keeps the current tablet layout and all orientations.
```

Play 쪽도 같은 취지: `com.iharu.app` 유지, 로컬 데이터 불변, 폰 form factor만 추가.

## 스크린샷 체크리스트

스토어 제출용 이미지는 이 문서의 체크리스트로 직접 촬영한다. 저장소에 바이너리 스크린샷을 생성하지 않는다. 기존 iPad 샷은 유지한다.

### App Store (필수)

- [ ] **iPhone 6.7"** (예: 15 Pro Max / 16 Plus) — 세로
- [ ] **iPhone 6.1"** (예: 15 / 16) — 세로
- [ ] **기존 iPad 샷 유지** (12.9" / 11")
- [ ] 화면 구성: 오늘의 일정, 일정 만들기, 활동 관리, 설정

촬영 팁: 시뮬레이터 `⌘S` 또는 실기기. 노치·홈 인디케이터가 잘리지 않게 전체 화면.

### Play Store (필수)

- [ ] **Android phone** (예: Pixel 6/8, ~6.3") — 세로
- [ ] **기존 7"/10" 태블릿 샷 유지**
- [ ] 화면 구성: 오늘의 일정, 일정 만들기, 활동 관리, 설정

Play Console에서 폰 form factor를 연 뒤에는 폰 스크린샷이 없으면 거절될 수 있다.

### App Store Connect / Play Console

- [ ] App Store Connect → 앱 정보 → **iPhone 디바이스 활성화** (유니버설)
- [ ] Play Console → 기기 카탈로그 → **phone form factor** 포함
- [ ] 설명에서 “태블릿 전용” 문구 제거 → “스마트폰 + 태블릿 / 유니버설”
- [ ] 심사 메모에 위 유니버설 전환 문구 첨부

## 버전

스토어 게이트 해제와 함께 앱 버전 **1.1.0**.
