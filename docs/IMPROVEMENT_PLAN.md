# UI 개선 및 버그 개선 계획

## 1. 활동 관리 메뉴 개선

### 1.1 활동 그리드 레이아웃 (패드 세로/가로 모드)

#### 현재 상태
- `ActivityCard`: 고정 너비 `180px`
- `activityGrid`: `flexWrap`, `gap: 20`, `justifyContent: 'flex-start'`
- 화면 크기에 따라 한 줄에 들어가는 카드 수가 달라짐 (현재 고정 크기라 공간 활용 미흡)

#### 개선 방향

**목표:** 세로 모드 4열, 가로 모드 6열로 꽉 차게 배치

1. **반응형 카드 너비 계산**
   ```
   portrait(세로): 4열 → cardWidth = (screenWidth - padding*2 - gap*3) / 4
   landscape(가로): 6열 → cardWidth = (screenWidth - padding*2 - gap*5) / 6
   ```

2. **구현 포인트**
   - `ActivitiesScreen`에서 `useWindowDimensions()`로 width/height 획득 (이미 사용 중)
   - `isLandscape = width > height`로 방향 판단
   - `ActivityCard`에 `width` prop 전달 또는 `contentContainerStyle`로 동적 계산
   - 현재 padding: 32 * 2 = 64, gap: 20 적용

3. **예시 계산 (패드 768px 가정)**
   - 세로: `(768 - 64 - 60) / 4 ≈ 161px` 또는 더 넓은 여백을 두고 `(768 - 128) / 4 - 15 ≈ 145px`
   - 가로: `(1024 - 128) / 6 - 16 ≈ 132px`

4. **추가 고려 사항**
   - 최소 카드 너비 (예: 120px) 설정으로 너무 작아지지 않도록
   - `ActivityCard`의 `minHeight: 180`는 유지하되, 모바일/패드에 따라 조정 가능

---

### 1.2 새 활동 추가 모달 — 이모지·카테고리 확장

#### 현재 상태
- **이모지:** 14개, 가로 스크롤, 64×64 크기, 단순 이모지
- **카테고리:** 8개 텍스트 칩 형태

#### 개선 방향

**이모지 → 3D 아이콘 대체 옵션**

| 방식 | 설명 | 추천도 |
|------|------|--------|
| **Material Icons (현재 사용 중)** | `@expo/vector-icons`의 MaterialIcons로 활동 유형별 아이콘 매핑 | ⭐⭐⭐ 빠른 적용 |
| **Lucide Icons / Phosphor** | 더 세련된 라인 아이콘 | ⭐⭐ |
| **3D 아이콘 (Lottie/GLB)** | `lottie-react-native`로 3D 느낌의 애니메이션 아이콘 | ⭐ (성능·번들 비용 고려) |
| **SF Symbols (iOS) + Material (Android)** | 플랫폼 네이티브 아이콘 | ⭐⭐ |

**권장 접근: 하이브리드**
- **단기:** Material Icons로 `emojis.ts`의 key별 매핑 추가 (예: `homework` → `edit-document`, `reading` → `menu-book`)
- **중기:** 별도 `IconPicker` 컴포넌트로 “이모지” / “아이콘” 탭 제공, 사용자가 선택 방식 전환 가능

**카테고리 확장**
- 현재 8개: 공부, 놀이, 독서, 운동, 식사, 휴식, 미술, 음악
- **추가 후보:** 외출, 수면, 게임, 창작, 기타
- **UI:** 카테고리별 색상/아이콘을 함께 표시 (현재 색상만 있음)

---

## 2. 오늘의 일정 — 알림 동작 개선

### 2.1 현재 알림 방식의 문제점

#### 아키텍처
- `expo-notifications` 로컬 알림
- 활동 시작 **5분 전** 고정 알림
- `AsyncStorage`에 `itemId → enabled` 저장
- `scheduleItem.id`를 identifier로 사용 (`activity-${itemId}`)

#### 예상 원인 (실기기에서 동작 안 함)

| 구분 | 문제점 | 상세 |
|------|--------|------|
| **노출 방식** | 알림 버튼이 `itemStatus === 'upcoming'`일 때만 표시됨 | 현재/미래/과거 등 다른 상태에서는 알림 설정 불가 |
| **권한 타이밍** | 앱 초기화 시점에 권한 요청 | ATTP(iOS) 등 다른 팝업과 겹칠 수 있음 |
| **Expo Go vs 빌드** | Expo Go와 standalone 빌드 동작 차이 | TestFlight 등에서는 Push 권한·프로비저닝 필요 |
| **identifier** | `scheduleItem.id` 의존 | 일정 복사 시 id 변경 가능성, 충돌/누락 위험 |
| **채널 (Android)** | `default` 채널만 사용 | 중요도·표시 방식 세분화 부족 |
| **iOS** | 백그라운드/포어그라운드 처리 | 앱이 killed 상태일 때 알림 수신 검증 필요 |
| **사용자 피드백** | 토글 후 결과 안내 없음 | “알림 설정됨” / “권한 필요” 등 메시지 부재 |
| **시간대** | `new Date()` 기반 | 타임존·서머타임 처리 확인 필요 |

### 2.2 개선 전략

#### Phase 1: 즉시 적용 가능

1. **알림 버튼 노출 확장**
   - `itemStatus === 'future'`일 때도 알림 설정 허용 (또는 `upcoming`과 `future` 모두)
   - “예정된 일정”에도 알림 on/off 가능하게

2. **사용자 피드백 추가**
   - 알림 on: “5분 전에 알림을 보내드릴게요”
   - 알림 off: “알림이 해제되었어요”
   - 권한 거부 시: “알림을 사용하려면 설정에서 권한을 허용해주세요” + 설정 앱 열기 유도

3. **권한 요청 시점 분리**
   - 첫 알림 토글 시점에 권한 요청
   - 앱 시작 시에는 권한 상태만 확인, 없으면 나중에 요청

#### Phase 2: 안정성 강화

4. **알림 스케줄링 검증**
   - `getScheduledNotifications()`로 스케줄 성공 여부 확인
   - 디버그용 “예약된 알림 목록” 화면(또는 개발자 옵션) 추가

5. **Android 알림 채널**
   - 채널 ID: `activity_reminders`
   - 중요도: `AndroidImportance.HIGH`, 소리·진동 명시

6. **iOS 설정**
   - `app.json` / `app.config.js`에 `UIBackgroundModes` 포함 여부 확인
   - standalone 빌드 시 Push Notifications capability·프로비저닝 프로파일 설정

#### Phase 3: UX 고도화

7. **알림 시간 선택**
   - 5분 고정 → 1/3/5/10분 등 사용자 선택 가능

8. **재스케줄링 트리거**
   - 앱 포어그라운드 복귀 시 오늘 알림 재스케줄
   - 일정 복사/변경 시 해당 날짜 알림 전체 재스케줄

9. **권한 UI**
   - 알림 끔 상태에서 토글 시 → 권한 요청 + “설정” 이동 안내

---

## 3. 구현 우선순위 요약

| 순위 | 항목 | 난이도 | 효과 |
|------|------|--------|------|
| 1 | 활동 그리드 4/6열 반응형 | 낮음 | 레이아웃 일관성 |
| 2 | 알림 버튼 노출 확장 (future 포함) | 낮음 | 설정 기회 확대 |
| 3 | 알림 토글 시 사용자 피드백 | 낮음 | 이해도 향상 |
| 4 | 이모지 → Material Icons 매핑 | 중간 | 아이콘 일관성 |
| 5 | 알림 권한 요청 시점 분리 | 중간 | 권한 수락률 개선 |
| 6 | 알림 시간 사용자 선택 | 중간 | 유연성 |
| 7 | 카테고리 확장 | 낮음 | 활동 분류 세분화 |
