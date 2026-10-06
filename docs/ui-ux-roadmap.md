# i하루 UI/UX 개선 로드맵 (작은 폰 레이아웃 감사)

작성일: 2026-10-05 (KST)  
대상 코드: `feat/parent-pin-weekday-repeat-lead` 워킹 트리 (미커밋 Today UX 변경 포함)  
감사 방식: 시뮬레이터 스크린샷 + 레이아웃 코드 읽기 (소스 변경/커밋 없음)

---

## 1. 현황 요약

### 1.1 디바이스 티어

| 티어 | 예시 | 논리 해상도 | 현재 `isCompact` | 높이 이슈 |
|------|------|-------------|------------------|-----------|
| **작은 폰 (small-height)** | iPhone SE 3rd | 375×667 | compact (min side < 768) | **심각**: 홈 버튼·낮은 세로 높이. 탭바+광고가 본문 상당 부분을 가림 |
| **작은 폰 (notch mini)** | iPhone 13/12 mini | 375×812 | compact | 폭은 SE와 동일, 세로는 여유. 그래도 헤더 이중화로 리스트가 거의 안 보임 |
| **일반 폰** | iPhone 17 | ~402×874 | compact | 진행 카드까지는 보이지만 **할 일 리스트는 거의 below-the-fold** |
| **패드** | iPad Air 11 | ~820×1180 | regular | 2열 Plan 레이아웃 가능. Today는 세로 여유 있으나 날짜 UI 중복·광고 오버레이는 동일 구조 |

현재 브레이크포인트는 **폭만** 본다 (`Math.min(width,height) < 768` → `isCompact`). SE와 일반 폰이 같은 compact 토큰을 쓰므로 **667pt 높이 전용 압축이 없다**.

참고: `src/hooks/layoutMetrics.ts:58-81`, `src/constants/config.ts:14-17`

### 1.2 시뮬레이터에서 관측한 화면

캡처 경로 (Mac): `docs/images/sim-test/layout-audit/`  
박스 복사본: `/workspace/iharu-layout-audit/`

| 파일 | 디바이스 | 관찰 |
|------|----------|------|
| `01-se-today.png` | SE 3rd | 헤더(날짜 카드+WeekStrip) + 「지금 할 시간」카드가 화면 대부분. **할 일 리스트 0개 노출**. 「완료했어요」버튼이 광고 배너에 거의 가려짐 |
| `02-mini-today.png` | 13 mini | SE와 동일 구조. 진행 카드 일부만 보임. 리스트 below-the-fold |
| `03-iphone17-today.png` | iPhone 17 | 진행 카드·「오늘의 할 일」제목 끝만 보임. 광고가 진행 카드/탭 위를 덮음 |
| `04-ipad-today.png` | iPad Air 11 | 세로 여유는 있으나 동일 스택(날짜+WeekStrip+현재활동+진행+광고). 리스트는 광고 아래로 밀림 |
| `05-se-today-xxl.png` | SE + XXL 텍스트 | Dynamic Type XXL에서도 BMJUA 고정 크기로 큰 변화 적음. **광고가 완료 버튼을 사실상 차단** |
| (참고) `live-now-pin.png`, `live-now-settings.png`, `ipadair11-plan-prior.png` | 이전 세션 | PIN 모달+키패드, 설정 밀도, iPad Plan 2-pane |

**탭 Plan/Activities/Settings 직접 캡처:** GUI 탭 불가 + React Navigation deep link 미구성 → **코드상 추정**으로 기술. Dev Client는 `열기` 시스템 확인 다이얼로그에 막혀 Release 시뮬 빌드로 우회함.

### 1.3 티어별 깨지는 점 (요약)

**작은 폰 SE (667pt)**
- Above-the-fold에 일정 리스트가 안 보임 (관측).
- 고정 광고(`AD_BANNER_HEIGHT=60`) + 플로팅 탭바(`TAB_BAR_HEIGHT=68`)가 현재 활동의 1차 CTA를 가림 (관측, XXL에서 특히 심함).
- HorizontalDatePicker + WeekStrip **이중 날짜 UI**로 헤더만 ~300pt 소모 (관측+코드).
- 긴 한국어 활동명 2줄 줄바꿈 (관측: 「피아노 연습하고 악보 정리하기」).

**mini (812pt)**
- SE와 동일 compact 토큰. 세로만 약간 나아져 진행 카드 일부 노출, 리스트는 여전히 스크롤 필수 (관측).

**일반 폰**
- compact 공유. 리스트 진입점이 화면 맨 아래 (관측).

**패드**
- Plan은 2-pane (관측: prior). Today는 폰용 세로 스택을 그대로 확장 → 여백 과다·광고 오버레이 동일 (관측).

---

## 2. 원칙

### 2.1 레이아웃 티어 (제안)

폭 **그리고** 높이를 동시에 본다.

```
isPhone     = min(w,h) < 768
isSmallH    = h < 700          // SE급
isCompactW  = w < 400          // SE/mini 폭
tier:
  phoneSmall   = isPhone && isSmallH     // SE
  phoneRegular = isPhone && !isSmallH    // mini / 17
  tablet       = !isPhone
```

토큰 예시:
- `space`: phoneSmall 12 / phoneRegular 16 / tablet 32  
- `titleSize`: 20 / 22 / 28  
- `cardPad`: 12 / 14 / 24  
- `tabBarHeight`: phoneSmall 56 / 그 외 68  
- 타임라인 `SLOT_HEIGHT`: phone 48~56 / tablet 80  

구현 위치: `layoutMetrics.ts`, `useLayout.ts`, `useLayout.test.ts`

### 2.2 간격·타입 스케일
- 화면당 **한 가지** 날짜 내비 (HorizontalDatePicker **또는** WeekStrip, 역할 분리).
- Above-the-fold 목표 (Today, phoneSmall): **현재/다음 활동 1개 + 할 일 카드 ≥2개**가 탭바·광고 위에 보여야 함.
- 본문 폰트: 활동명 ≥16, 본문 ≥14, 캡션 ≥12 (아이 가독성).

### 2.3 터치 타깃
- 최소 **44×44pt** (Apple HIG).  
- 위반 후보: WeekStrip day (`paddingVertical: 6`, `WeekStrip.tsx:105-111`), Plan `viewModeButtonCompact` (`minHeight: 40`, `PlanScheduleScreen.tsx:763-766`), 알림 아이콘 영역은 48로 OK.

### 2.4 아이 친화·접근성
- 역할 색 유지 (`theme.ts`: today/now/complete)하되 **부분 달성 점 ≠ today 주황** (현재 `dotPartial`이 `SoftPopColors.today` — `WeekStrip.tsx:137-138`).
- 흰 글자 on `#6BCB77` / `#FF6B6B` 대비 점검 (WCAG AA 목표).
- Dynamic Type: 전역 `allowFontScaling`/`maxFontSizeMultiplier` 정책 없음 (**코드상 추정**: BMJUA 고정 pt). 아이 앱이므로 스케일 허용 상한(예: 1.3) + 레이아웃 리플로우 필요.
- VoiceOver: 완료/취소 accessibilityAction, 스와이프 힌트는 최초 1회 온보딩.

---

## 3. Phase 0 — 바로 고칠 버그

| ID | 문제 | 제안 변경 | 파일 | 노력 | 우선순위 |
|----|------|-----------|------|------|----------|
| P0-1 | **스와이프 완료 토스트 「취소」가 stale closure로 다시 완료 처리.** `showToast`의 `onPress: () => handleToggleComplete(itemId,'undo')`가 스와이프 직전 렌더의 `scheduleItems`를 닫아, undo 시 `wasCompleted===false` → 다시 `completed`로 설정 | undo는 `updateScheduleItem(itemId,{status:'planned'})`를 직접 호출하거나, `scheduleItems`/`handleToggleComplete`를 ref로 최신화. toast action도 ref에 최신 함수만 저장 | `TodayScreen.tsx:160-192`, `71`, `153-157` | S | P0 |
| P0-2 | **완료된 항목 체크박스가 `disabled`인데 라벨은 「완료 취소」** (`isDisabled`에 `completed` 포함) | 완료 항목은 탭으로 되돌리기 허용(또는 스와이프만 허용 시 라벨을 「완료됨」으로 변경하고 disabled 이유 명시) | `TodayScheduleItem.tsx:109-178` | S | P0 |
| P0-3 | **마지막 항목을 스와이프로 완료하면 clap이 스킵**되고, 축하 모달은 `allCompleted` effect에만 의존. 버튼 경로도 `!isLastActivity`일 때만 clap | 스와이프/버튼 마지막 완료 시 celebration 경로를 명시적으로 트리거하거나, clap/celebration 역할을 문서화하고 스와이프에도 celebration 보장 테스트 | `TodayScreen.tsx:174-191`, `138-151` | S | P0 |
| P0-4 | SE에서 **광고가 「완료했어요」 CTA를 가림** (관측: `01-se-today`, `05-se-today-xxl`) | `adBannerBottom`/`contentPadWithAd` 재계산; 작은 높이에서는 광고를 콘텐츠 흐름 안으로 넣거나 현재 활동 카드 bottom inset 확보; 로드 실패 시 높이 0 | `TodayScreen.tsx:676-685`, `AdBanner.tsx`, `useLayout.ts:30-40` | M | P0 |

---

## 4. Phase 1 — 작은 폰 레이아웃 기반

| ID | 문제 | 제안 변경 | 파일 | 노력 | 우선순위 |
|----|------|-----------|------|------|----------|
| P1-1 | compact 단일 티어로 SE/17 동일 토큰 | §2.1 tier 도입 + 단위 테스트(375×667 / 375×812 / 402×874 / 820×1180) | `layoutMetrics.ts`, `useLayout.ts`, `useLayout.test.ts`, `config.ts` | M | P0 |
| P1-2 | **HorizontalDatePicker + WeekStrip 중복**으로 헤더 ~300pt (관측) | phoneSmall: WeekStrip만(주간 점+탭). phoneRegular: 둘 중 하나 기본 + 「달력」확장. 역할: Strip=주간 달성, Picker=날짜 이동 | `TodayScreen.tsx:386-400`, `WeekStrip.tsx`, `HorizontalDatePicker.tsx` | M | P0 |
| P1-3 | Today above-the-fold에 리스트 미노출 (관측 SE/mini/17) | 헤더 압축(space 12, title 20, date 텍스트 한 줄), 현재 활동 카드 패딩↓, 진행 카드를 접이식/헤더 인라인 %, 리스트를 현재 활동 바로 아래 | `TodayScreen.tsx` styles ~336-580, `layoutMetrics` | L | P0 |
| P1-4 | 탭바 68 + 광고 60이 SE에서 치명적 | phoneSmall 탭 높이·마진 축소; 광고는 로드 후에만 공간 예약; `getScrollBottomPadding`과 sticky bottom 정렬 | `MainTabNavigator.tsx:57-110`, `layoutMetrics.ts:7-8`, `useLayout.ts` | M | P1 |
| P1-5 | SE safe area: 노치 없음·홈 버튼 (`edges=['top']`) | bottom inset 0일 때 탭바 `marginBottom` 최소값 재검토(현재 `max(insets.bottom,12)`가 홈 버튼 기기에서 12 강제) | `MainTabNavigator.tsx:105-107` | S | P1 |

---

## 5. Phase 2 — 화면별 개선

### 2.1 Today
| ID | 문제 | 제안 | 파일 | 노력 | 우선순위 |
|----|------|------|------|------|----------|
| P2-T1 | 진행 카드가 리스트를 밀어냄 | 진행률을 헤더 우측 뱃지/얇은 바로 축소; 상세는 확장 | `TodayScreen.tsx:484-580` | M | P1 |
| P2-T2 | 활동명 truncation/`numberOfLines` 없음 | `numberOfLines={2}` + ellipsize; phoneSmall 폰트 16 유지 | `TodayScheduleItem.tsx:207-215`, currentActivityName | S | P1 |
| P2-T3 | empty 아이콘 64·padding 과다 | phoneSmall empty `paddingVertical` 24, icon 48 | `TodayScreen.tsx:583-613`, styles empty* | S | P2 |
| P2-T4 | Toast `bottom:120` 고정 | `tabBarOffset + ad + 8`로 동적 배치 | `Toast.tsx:100-105` | S | P2 |

### 2.2 Plan / Timeline
| ID | 문제 | 제안 | 파일 | 노력 | 우선순위 |
|----|------|------|------|------|----------|
| P2-P1 | `SLOT_HEIGHT=80` 고정 → 하루 스크롤 과다 (**코드상 추정**) | compact 48~56; 가시 시간대(예: 7–21시) 옵션 | `config.ts:6-11`, `TimelineViewV2.tsx` | M | P1 |
| P2-P2 | compact chip+timeline은 있으나 nested ScrollView 마찰 | 칩 sticky + 타임라인만 세로 스크롤 | `PlanScheduleScreen.tsx:315-444` | M | P2 |
| P2-P3 | `viewModeButtonCompact` minHeight 40 | 44로 상향 | `PlanScheduleScreen.tsx:763-766` | S | P1 |

### 2.3 Activities
| ID | 문제 | 제안 | 파일 | 노력 | 우선순위 |
|----|------|------|------|------|----------|
| P2-A1 | 2열·minWidth 140은 OK, FAB+탭+광고 겹침 여지 | `fabCompact` bottom을 `contentPadWithAd`와 일치 | `ActivitiesScreen.tsx:164-182` | S | P2 |
| P2-A2 | ActivityFormModal `maxHeight 90%` + 키보드 (**코드상 추정** SE) | KeyboardAvoiding + 섹션 접기; emoji 그리드 높이 cap | `ActivityFormModal.tsx:345-349` | M | P1 |

### 2.4 Settings / Modals
| ID | 문제 | 제안 | 파일 | 노력 | 우선순위 |
|----|------|------|------|------|----------|
| P2-S1 | appInfo `padding:40` / section `marginBottom:32` 밀도 과다 | compact 이미 일부 축소(`appInfoCardCompact`) — phoneSmall 추가 압축 | `ProfileScreen.tsx:740-811` | S | P2 |
| P2-S2 | PinLock + number-pad가 SE에서 모달을 밀어올림 (**코드상 추정**, prior `live-now-pin`) | 키보드 열릴 때 카드 top 정렬 / ScrollView | `PinLockModal.tsx:73-84` | M | P1 |
| P2-S3 | leadChip `paddingVertical:8` 타깃 점검 | minHeight 44 | `ProfileScreen.tsx:724-726` | S | P2 |

---

## 6. Phase 3 — 아이 친화 UX polish

| ID | 문제 | 제안 | 파일 | 노력 | 우선순위 |
|----|------|------|------|------|----------|
| P3-1 | 완료 피드백이 `Vibration`만 (`feedback.ts`) | `expo-haptics` Impact/Notification (네이티브 리빌드 필요 — 주석에도 명시됨) | `feedback.ts`, `package.json` | M | P2 |
| P3-2 | 흰 글자 on `#6BCB77` / primary coral 대비 | 대비 미달 시 텍스트 색 또는 배경 조정 | `theme.ts`, 완료 버튼 스타일 | S | P2 |
| P3-3 | `dotPartial` = today orange → 「오늘」과 「부분 달성」혼동 (관측+코드) | partial을 amber/blue-gray로 분리 | `WeekStrip.tsx:137-138`, `theme.ts` | S | P1 |
| P3-4 | 스와이프 힌트가 매번 텍스트로만 표시 | 최초 1회 툴팁/애니메이션 온보딩 후 숨김 | `TodayScreen.tsx:632-636` | M | P2 |
| P3-5 | VoiceOver: 스와이프 액션·완료 취소 | `accessibilityActions` / 커스텀 액션 추가 | `TodayScheduleItem.tsx` | M | P2 |
| P3-6 | Dynamic Type 무시 | `maxFontSizeMultiplier={1.3}` + 주요 Text 적용 정책 | 전역 Text wrapper 또는 화면별 | L | P3 |

---

## 7. Phase 4 — 검증 체계

| ID | 문제 | 제안 | 파일 | 노력 | 우선순위 |
|----|------|------|------|------|----------|
| P4-1 | 작은 폰 회귀 없음 | 디바이스 매트릭스: SE / mini / 17 / iPad Air + Android small(360×640) 체크리스트 | `docs/` | M | P1 |
| P4-2 | 스크린샷 회귀 | Detox/Maestro 또는 `simctl io` 스크립트로 Today 빈/채움 시나리오 | `docs/images/sim-test/` | L | P2 |
| P4-3 | layoutMetrics / getWeekOverview 단위 테스트 확장 | small-height tier, partial/complete 점 색 규칙 | `useLayout.test.ts`, `statsUtils` tests | M | P1 |
| P4-4 | P0 버그 회귀 테스트 | toggle undo, last-item swipe celebration | TodayScreen 테스트 또는 통합 | M | P0 |

---

## 8. Above-the-fold 수치 (코드 추정 + 관측 정합)

가정: iOS `tabBarOffset = 68 + max(bottom,10)`, 광고 60, SafeArea top만.

| 기기 | usable≈ | 헤더(날짜+WeekStrip)≈ | 리스트 카드 노출(추정) | 관측 |
|------|---------|------------------------|------------------------|------|
| SE 667 | ~509 | ~298 | 헤더+현재활동 후 **0~1** | 리스트 0, CTA가 광고에 가림 |
| mini 812 | ~600 | ~298 | **0~2** | 진행만 일부 |
| 17 | ~653 | ~298 | **1~2** 제목만 | 할 일 제목 끝만 |
| iPad | ~1008 | ~354 | 여유 있으나 광고가 리스트 상단 가림 | 동일 |

---

## 9. 권장 실행 순서

1. **P0** (P0-1~4): 완료/undo/CTA 가림 — 신뢰·아이 사용성에 직결  
2. **P1-1~3**: tier + 날짜 UI 단일화 + Today fold  
3. **P2** 타임라인 슬롯·모달·터치 44  
4. **P3** 햅틱·대비·온보딩·a11y  
5. **P4** 매트릭스·스크린샷·테스트  

예상 총량: P0 ≈ 1–2일, P1 ≈ 3–5일, P2 ≈ 1주, P3–P4 ≈ 1주+ (1인 기준, 네이티브 햅틱 리빌드 별도).

---

## 10. 감사 메모 / 한계

- **가능했던 것:** SE·13 mini 시뮬 생성, Release 시뮬 빌드 설치, Today 시드 데이터로 4기기(+SE XXL) 스크린샷, 레이아웃 코드 전수 검토.
- **불가/우회:** Dev Client는 iOS 「‘i하루’에서 열겠습니까?」확인을 GUI 없이 통과 불가 → Release `main.jsbundle` 빌드로 대체. 탭 전환 deep link 없음 → Plan/Activities/Settings는 코드+이전 스크린샷. 가로모드는 GUI 없이 스킵(패드가 가로로 뜬 경우 있음).
- **남겨둔 상태:** Metro(`8081`), SE/mini/17/iPad 부팅, Release 앱 설치(기존 Dev 데이터는 `docs/images/sim-test/layout-audit/.backup/`에 백업).
- 소스 커밋/푸시/수정 없음. 로드맵만 문서화.
