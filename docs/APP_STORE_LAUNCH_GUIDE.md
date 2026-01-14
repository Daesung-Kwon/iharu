# i하루 앱 - App Store 런칭 가이드

> iPad 전용 앱을 App Store에 배포하기 위한 완전한 체크리스트와 가이드

---

## 📋 목차

1. [사전 준비사항](#1-사전-준비사항)
2. [프로젝트 설정](#2-프로젝트-설정)
3. [앱 아이콘 및 이미지 준비](#3-앱-아이콘-및-이미지-준비)
4. [EAS Build 설정](#4-eas-build-설정)
5. [Apple Developer 계정 설정](#5-apple-developer-계정-설정)
6. [앱 빌드 및 업로드](#6-앱-빌드-및-업로드)
7. [App Store Connect 설정](#7-app-store-connect-설정)
8. [앱 심사 제출](#8-앱-심사-제출)
9. [런칭 후 관리](#9-런칭-후-관리)

---

## 1. 사전 준비사항

### 1.1 필수 요구사항

- [ ] **Apple Developer 계정** (연간 $99)
  - https://developer.apple.com/programs/
  - 등록 완료까지 24-48시간 소요될 수 있음
  
- [ ] **macOS가 설치된 Mac 컴퓨터**
  - Xcode 및 관련 도구 설치 필요
  
- [ ] **Expo EAS 계정** (무료 플랜 가능)
  - https://expo.dev/ 계정 생성
  
- [ ] **실제 iPad 디바이스** (테스트용)
  - 최신 iOS 버전 설치 권장

### 1.2 소프트웨어 설치

```bash
# Node.js (v18 이상 권장)
node --version

# npm 또는 yarn
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI
npm install -g eas-cli

# CocoaPods (macOS만)
sudo gem install cocoapods
```

### 1.3 확인 사항

- [ ] 앱 이름: "i하루"
- [ ] Bundle Identifier: `com.dailyschedule.app`
- [ ] 버전: 1.0.0
- [ ] 타겟 기기: iPad 전용
- [ ] 최소 iOS 버전 확인 필요

---

## 2. 프로젝트 설정

### 2.1 app.json 설정 완료 확인

현재 설정 확인:
- ✅ 앱 이름: "i하루"
- ✅ Bundle Identifier: "com.dailyschedule.app"
- ✅ iPad 전용: `"deviceFamily": ["ipad"]`
- ⚠️ EAS projectId: **설정 필요**

### 2.2 EAS 프로젝트 초기화

```bash
cd /Users/malife/daily-schedule-app

# EAS 로그인
eas login

# EAS 프로젝트 초기화
eas init

# 프로젝트 ID가 생성되면 app.json에 자동 추가됨
```

### 2.3 app.json 최종 점검 및 수정

다음 항목들을 확인하고 필요시 수정:

```json
{
  "expo": {
    "name": "i하루",
    "slug": "daily-schedule-app",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.dailyschedule.app",
      "requireFullScreen": false,
      "deviceFamily": ["ipad"],
      "buildNumber": "1",
      "infoPlist": {
        "NSUserNotificationsUsageDescription": "일정 알림을 받기 위해 알림 권한이 필요합니다.",
        "NSPhotoLibraryUsageDescription": "백업 파일을 저장하기 위해 사진 라이브러리 접근 권한이 필요합니다.",
        "NSPhotoLibraryAddUsageDescription": "백업 파일을 저장하기 위해 사진 라이브러리 추가 권한이 필요합니다."
      }
    }
  }
}
```

### 2.4 eas.json 생성

프로젝트 루트에 `eas.json` 파일 생성:

```bash
eas build:configure
```

또는 수동으로 생성:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "simulator": false
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

---

## 3. 앱 아이콘 및 이미지 준비

### 3.1 필수 이미지 파일

#### 앱 아이콘
- [ ] **1024x1024 PNG** (필수, 투명도 없음)
  - 파일명: `assets/icon.png`
  - iOS Human Interface Guidelines 준수
  - iPad에서 작은 크기로도 보기 좋아야 함
  - 모서리 자동 처리되므로 사각형으로 제작

#### 스플래시 스크린
- [ ] **1024x1024 PNG** (선택, 추천)
  - 파일명: `assets/splash-icon.png`
  - 또는 배경색만 사용 가능: `#FFF8E7`

### 3.2 App Store 스크린샷 (필수)

#### iPad Pro 12.9인치 (3세대 이후)
- [ ] 최소 1개, 최대 10개
- 크기: **2048 x 2732** 픽셀 (세로) 또는 **2732 x 2048** (가로)
- PNG 또는 JPEG

#### iPad Pro 11인치
- [ ] 최소 1개, 최대 10개
- 크기: **1668 x 2388** 픽셀 (세로) 또는 **2388 x 1668** (가로)

#### iPad Pro 12.9인치 (1세대 및 2세대) - 선택
- 크기: **2048 x 2732** 픽셀 (세로) 또는 **2732 x 2048** (가로)

#### iPad (10.2인치) - 선택
- 크기: **1620 x 2160** 픽셀 (세로) 또는 **2160 x 1620** (가로)

**스크린샷 제작 팁:**
1. 실제 iPad에서 앱 실행 후 스크린샷 캡처
2. 또는 Xcode Simulator에서 캡처 (⌘ + S)
3. 주요 기능 화면 포함:
   - 홈/대시보드 화면
   - 일정 만들기 화면
   - 활동 관리 화면
   - 프로필 화면

### 3.3 App Store 이미지

- [ ] **앱 미리보기 비디오** (선택, 추천)
  - 최대 30초
  - MP4, MOV, M4V 형식
  - 주요 기능 소개

### 3.4 이미지 체크리스트

```
assets/
├── icon.png                    ✅ 1024x1024
├── splash-icon.png            ✅ 1024x1024 (또는 배경색만)
└── screenshots/               ⚠️ 준비 필요
    ├── ipad-pro-12.9-1.png    (2048x2732)
    ├── ipad-pro-12.9-2.png
    ├── ipad-pro-11-1.png      (1668x2388)
    └── ipad-pro-11-2.png
```

---

## 4. EAS Build 설정

### 4.1 EAS 빌드 프로파일 확인

`eas.json`이 제대로 설정되었는지 확인:

```bash
eas build:configure
```

### 4.2 인증서 및 프로비저닝 프로파일

EAS Build가 자동으로 관리해주지만, 수동 설정도 가능:

```bash
# 인증서 및 프로파일 자동 관리 (권장)
eas credentials

# 또는 수동으로 Apple Developer에서 생성 가능
```

### 4.3 환경 변수 설정 (필요시)

```bash
# EAS Secrets 관리
eas secret:create --scope project --name API_URL --value "https://api.example.com"
```

---

## 5. Apple Developer 계정 설정

### 5.1 App ID 생성

1. https://developer.apple.com/account 접속
2. **Certificates, Identifiers & Profiles** 이동
3. **Identifiers** > **+** 클릭
4. **App IDs** 선택
5. **App** 선택 후 Continue
6. **Description**: "i하루"
7. **Bundle ID**: `com.dailyschedule.app` (Explicit)
8. **Capabilities** 선택:
   - [x] Push Notifications (알림 사용 시)
   - [ ] In-App Purchase (사용하지 않음)
   - [ ] Sign in with Apple (사용하지 않음)
9. **Continue** > **Register**

### 5.2 앱 정보 등록 (App Store Connect)

**나중에 App Store Connect에서 자동 생성되므로 선택 사항입니다.**

---

## 6. 앱 빌드 및 업로드

### 6.1 프로덕션 빌드 생성

```bash
# 프로덕션 빌드 시작
eas build --platform ios --profile production

# 또는 대화형 모드
eas build --platform ios
```

**빌드 프로세스:**
1. EAS 서버에서 빌드 시작
2. 빌드 완료까지 약 10-20분 소요
3. 완료 후 다운로드 링크 제공

### 6.2 빌드 확인

빌드 완료 후:
- [ ] 빌드 성공 여부 확인
- [ ] 빌드 로그 확인 (오류 체크)
- [ ] 다운로드하여 테스트 가능 (TestFlight 또는 직접 설치)

### 6.3 App Store Connect에 업로드

**방법 1: EAS Submit (권장)**

```bash
# 자동으로 App Store Connect에 제출
eas submit --platform ios --latest

# 또는 특정 빌드 지정
eas submit --platform ios --id BUILD_ID
```

**방법 2: 수동 업로드 (Transporter 앱)**

1. Transporter 앱 다운로드 (Mac App Store)
2. 빌드한 `.ipa` 파일 선택
3. Apple ID로 로그인
4. 업로드

**방법 3: Xcode Organizer**

1. Xcode > Window > Organizer
2. Archives 탭에서 빌드 선택
3. "Distribute App" 클릭
4. App Store Connect 선택
5. 업로드

---

## 7. App Store Connect 설정

### 7.1 App Store Connect 접속

1. https://appstoreconnect.apple.com 접속
2. **내 앱** 클릭
3. **+** 버튼 > **새로운 앱** 클릭

### 7.2 앱 정보 입력

#### 기본 정보
- **플랫폼**: iOS
- **이름**: "i하루"
- **기본 언어**: 한국어
- **Bundle ID**: `com.dailyschedule.app` (선택)
- **SKU**: 고유 식별자 (예: `iharu-001`)
- **사용자 액세스**: 완전한 액세스 권한

#### 가격 및 판매 범위
- **가격**: 무료
- **판매 범위**: 모든 국가 (또는 선택)

#### 앱 정보
- **카테고리**:
  - Primary: **생산성** (Productivity)
  - Secondary: 교육 (Education) 또는 생활 (Lifestyle)
  
- **콘텐츠 권한**: 
  - 4+ (모든 연령)
  - 또는 앱의 실제 연령 대상에 맞게 설정

### 7.3 앱 설명 작성

#### 이름 (앱 제목)
- 최대 30자
- 예: "i하루 - 하루 일과표"

#### 부제목 (선택)
- 최대 30자
- 예: "아이를 위한 일정 관리"

#### 설명 (필수)
최대 4000자, 주요 내용 포함:

```
i하루는 아이들이 스스로 하루 일과를 계획하고 관리할 수 있는 iPad 전용 앱입니다.

주요 기능:
• 활동 관리: 자주 하는 활동을 저장하고 재사용
• 일정 만들기: 드래그 앤 드롭으로 타임라인에 일정 배치
• 오늘의 일정: 대시보드에서 진행 상황 확인 및 체크리스트
• 알림 기능: 일정 알림으로 시간 관리 지원

특징:
• 직관적인 드래그 앤 드롭 인터페이스
• 밝고 친근한 디자인
• 태블릿에 최적화된 레이아웃
• 모든 데이터는 기기에만 저장 (프라이버시 보호)

아이들이 하루 일과를 시각적으로 계획하고, 완료한 일정을 체크하면서 
성취감을 느낄 수 있도록 설계되었습니다.
```

#### 키워드 (필수)
- 최대 100자
- 쉼표로 구분
- 예: "일정관리,일과표,스케줄,아이,아동,태블릿,계획,타임라인"

#### 지원 URL (필수)
- 개인정보처리방침: `https://yourwebsite.com/privacy`
- 마케팅 URL (선택): `https://yourwebsite.com`

#### 프로모션 텍스트 (선택)
- 최대 170자
- 업데이트 시 즉시 반영됨 (심사 불필요)

### 7.4 스크린샷 업로드

1. **App Store Connect > 앱 > 버전 > 스크린샷**
2. 각 기기 크기별로 스크린샷 업로드
3. 순서대로 정렬 (첫 번째가 대표 이미지)
4. 최소 1개, 최대 10개

### 7.5 앱 아이콘 업로드

- **1024x1024 PNG** 업로드
- 투명도 없어야 함
- 모서리 자동 처리됨

### 7.6 앱 미리보기 (선택)

- 비디오 업로드 (최대 30초)
- 또는 스크린샷으로 대체 가능

### 7.7 버전 정보

- **버전**: 1.0.0
- **빌드**: 1 (또는 업로드한 빌드 번호)
- **Copyright**: © 2025 [회사명 또는 이름]
- **연락처 정보**: 이메일 주소

### 7.8 앱 심사 정보

#### 연락처 정보
- **첫 번째 이름**: [이름]
- **성**: [성]
- **전화번호**: [전화번호]
- **이메일 주소**: [이메일]

#### 데모 계정 (필요시)
- 로그인이 필요한 경우 제공
- 아니면 "데모 계정 불필요" 선택

#### 참고사항 (선택)
심사 담당자에게 전달할 정보:
```
이 앱은 iPad 전용입니다.
모든 데이터는 로컬 디바이스에만 저장되며, 
서버와의 통신은 하지 않습니다.
```

#### 부속 파일 (선택)
- 추가 설명 문서 업로드 가능

### 7.9 버전 출시 설정

- **자동 출시**: 심사 통과 후 자동 출시
- **수동 출시**: 심사 통과 후 수동으로 출시 버튼 클릭

---

## 8. 앱 심사 제출

### 8.1 최종 점검

제출 전 확인사항:

- [ ] 앱 정보 모두 입력 완료
- [ ] 스크린샷 업로드 완료 (최소 1개)
- [ ] 앱 아이콘 업로드 완료
- [ ] 앱 설명 작성 완료
- [ ] 버전 정보 입력 완료
- [ ] 연락처 정보 입력 완료
- [ ] 빌드 업로드 완료
- [ ] 개인정보처리방침 URL 제공 (필요시)

### 8.2 심사 제출

1. **App Store Connect > 앱 > 버전**
2. 모든 필수 항목이 ✅ 체크되어 있는지 확인
3. **"심사를 위해 제출"** 버튼 클릭
4. 확인 다이얼로그에서 제출 확인

### 8.3 심사 프로세스

**심사 소요 시간:**
- 일반적으로 **24-48시간** 소요
- 복잡한 앱은 **3-5일** 소요될 수 있음
- 첫 출시는 더 오래 걸릴 수 있음

**심사 상태:**
1. ⏳ **대기 중** - 제출 완료, 심사 대기
2. 🔍 **심사 중** - Apple이 앱 검토 중
3. ✅ **승인됨** - 심사 통과, 출시 대기
4. ❌ **거부됨** - 문제 발견, 수정 필요
5. 🚀 **출시됨** - App Store에서 사용 가능

**심사 거부 시:**
- Apple에서 거부 사유 안내
- 문제 수정 후 다시 제출
- Resolution Center에서 소통

---

## 9. 런칭 후 관리

### 9.1 출시 확인

- [ ] App Store에서 앱 검색 확인
- [ ] 앱 다운로드 및 설치 테스트
- [ ] 모든 기능 정상 작동 확인

### 9.2 모니터링

#### App Store Connect 대시보드
- 다운로드 수
- 크래시 리포트
- 사용자 리뷰
- 평점

#### 앱 분석
- 사용자 행동 분석 (Firebase Analytics 등)
- 크래시 로깅 (Sentry 등)

### 9.3 업데이트 프로세스

앱 업데이트 시:

1. **버전 업데이트**
   ```json
   // app.json
   {
     "version": "1.1.0",
     "ios": {
       "buildNumber": "2"
     }
   }
   ```

2. **변경사항 문서화**
   - 앱 설명에 업데이트 내용 추가
   - "새로운 기능" 섹션 업데이트

3. **빌드 및 업로드**
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios --latest
   ```

4. **App Store Connect 업데이트**
   - 새 빌드 선택
   - 업데이트 내용 입력
   - 심사 제출

---

## 📝 체크리스트 요약

### 필수 준비물
- [ ] Apple Developer 계정 ($99/년)
- [ ] EAS 계정 (무료 가능)
- [ ] 앱 아이콘 1024x1024
- [ ] 스크린샷 (최소 1개)
- [ ] 앱 설명 (한국어)
- [ ] 개인정보처리방침 URL

### 프로젝트 설정
- [ ] app.json 설정 완료
- [ ] eas.json 생성
- [ ] EAS 프로젝트 초기화
- [ ] Bundle ID 확인

### 빌드 및 업로드
- [ ] EAS 빌드 성공
- [ ] App Store Connect에 업로드 완료

### App Store Connect
- [ ] 앱 정보 입력 완료
- [ ] 스크린샷 업로드 완료
- [ ] 앱 설명 작성 완료
- [ ] 심사 정보 입력 완료

### 제출
- [ ] 모든 필수 항목 완료 확인
- [ ] 심사 제출 완료
- [ ] 심사 결과 대기

---

## 🔗 유용한 링크

- [Apple Developer](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Expo EAS](https://expo.dev/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## ⚠️ 주의사항

1. **Bundle ID는 변경 불가**: 처음 설정한 Bundle ID는 변경할 수 없습니다.
2. **앱 이름 중복**: 다른 앱과 이름이 중복되면 거부될 수 있습니다.
3. **심사 지침 준수**: App Store Review Guidelines를 반드시 확인하세요.
4. **개인정보처리방침**: 개인정보를 수집하지 않더라도 URL 제공이 필요할 수 있습니다.
5. **테스트 필수**: 실제 iPad에서 충분히 테스트한 후 제출하세요.

---

## 📞 지원

문제가 발생하면:
1. [Expo 문서](https://docs.expo.dev/) 확인
2. [Apple Developer 포럼](https://developer.apple.com/forums/) 검색
3. EAS Support: support@expo.dev

---

**작성일**: 2025-01-XX  
**최종 업데이트**: 2025-01-XX
