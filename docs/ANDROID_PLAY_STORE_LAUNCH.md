# i하루 앱 - Google Play Store 런칭 가이드

> Android 태블릿 전용 앱을 Play Store에 배포하기 위한 완전한 가이드

---

## 💰 비용 비교

- **Apple App Store**: $99/년 (연간 구독)
- **Google Play Store**: $25 (일회성, 평생)

---

## 📋 목차

1. [사전 준비사항](#1-사전-준비사항)
2. [EAS Build 설정](#2-eas-build-설정)
3. [Android 개발 빌드 생성](#3-android-개발-빌드-생성)
4. [Play Store 계정 설정](#4-play-store-계정-설정)
5. [앱 빌드 및 업로드](#5-앱-빌드-및-업로드)
6. [Play Store Connect 설정](#6-play-store-connect-설정)
7. [앱 심사 제출](#7-앱-심사-제출)

---

## 1. 사전 준비사항

### 1.1 필수 요구사항

- [ ] **Google Play Console 계정** ($25 일회성)
  - https://play.google.com/console/signup
  - 결제 완료까지 즉시 가능
  
- [ ] **Expo EAS 계정** (무료 플랜 가능)
  - https://expo.dev/ 계정 생성
  
- [ ] **실제 Android 태블릿** (테스트용, 선택)
  - 최신 Android 버전 설치 권장

### 1.2 소프트웨어 설치

```bash
# Node.js (v18 이상 권장)
node --version

# npm 또는 yarn
npm --version

# EAS CLI
npm install -g eas-cli

# Expo CLI (선택)
npm install -g expo-cli
```

### 1.3 확인 사항

- [ ] 앱 이름: "i하루"
- [ ] Package Name: `com.dailyschedule.app`
- [ ] 버전: 1.0.0
- [ ] 타겟 기기: Android 태블릿 전용
- [ ] 최소 Android 버전 확인 필요

---

## 2. EAS Build 설정

### 2.1 EAS 프로젝트 초기화

```bash
cd /Users/malife/daily-schedule-app

# EAS 로그인
eas login

# EAS 프로젝트 초기화
eas init
```

### 2.2 eas.json 생성

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
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 3. Android 개발 빌드 생성

### 3.1 개발 빌드 생성 (테스트용)

```bash
cd /Users/malife/daily-schedule-app

# 개발 빌드 생성 (테스트용)
eas build --profile development --platform android
```

**빌드 프로세스:**
1. EAS 서버에서 빌드 시작
2. 빌드 완료까지 약 15-25분 소요
3. 완료 후 다운로드 링크 제공

### 3.2 빌드 확인 및 테스트

빌드 완료 후:
- [ ] 빌드 성공 여부 확인
- [ ] APK 다운로드
- [ ] 실제 태블릿 또는 에뮬레이터에 설치하여 테스트

```bash
# APK 설치
adb install path/to/your-app.apk
```

---

## 4. Play Store 계정 설정

### 4.1 Google Play Console 가입

1. https://play.google.com/console/signup 접속
2. Google 계정으로 로그인
3. **$25 일회성 결제** 완료
4. 개발자 계정 활성화 (즉시 가능)

### 4.2 서비스 계정 생성 (자동 업로드용, 선택)

자동 업로드를 원하는 경우:

1. **Google Cloud Console** 접속
2. **API 및 서비스** > **사용자 인증 정보**
3. **서비스 계정** 생성
4. **Play Console API** 권한 부여
5. **JSON 키** 다운로드

---

## 5. 앱 빌드 및 업로드

### 5.1 프로덕션 빌드 생성

```bash
cd /Users/malife/daily-schedule-app

# 프로덕션 빌드 생성 (AAB 형식)
eas build --profile production --platform android
```

**빌드 프로세스:**
1. EAS 서버에서 빌드 시작
2. 빌드 완료까지 약 15-25분 소요
3. 완료 후 다운로드 링크 제공
4. **AAB (Android App Bundle)** 형식으로 생성됨

### 5.2 Play Store Connect에 업로드

**방법 1: EAS Submit (권장)**

```bash
# 자동으로 Play Store Connect에 제출
eas submit --platform android --latest

# 또는 특정 빌드 지정
eas submit --platform android --id BUILD_ID
```

**방법 2: 수동 업로드**

1. Play Console 접속
2. **내 앱** > **앱 만들기** 클릭
3. **프로덕션** > **새 버전 만들기**
4. **AAB 파일 업로드** 클릭
5. 다운로드한 AAB 파일 업로드

---

## 6. Play Store Connect 설정

### 6.1 앱 정보 입력

#### 기본 정보
- **앱 이름**: "i하루"
- **기본 언어**: 한국어
- **앱 또는 게임**: 앱
- **무료 또는 유료**: 무료

#### 앱 카테고리
- **앱 카테고리**: 생산성 (Productivity)
- **태그**: 일정관리, 일과표, 스케줄

### 6.2 앱 설명 작성

#### 짧은 설명 (최대 80자)
```
아이들이 스스로 하루 일과를 계획하고 관리할 수 있는 태블릿 전용 앱
```

#### 전체 설명 (최대 4000자)
```
i하루는 아이들이 스스로 하루 일과를 계획하고 관리할 수 있는 Android 태블릿 전용 앱입니다.

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

태블릿 전용 앱입니다. 스마트폰에서는 실행되지 않을 수 있습니다.
```

### 6.3 그래픽 자산

#### 앱 아이콘
- **512x512 PNG** (필수)
- 파일: `assets/AppIcons/playstore.png` 사용

#### 스크린샷 (필수)

**7인치 태블릿 (최소 1개, 최대 8개)**
- 크기: **1024 x 600** 픽셀 (가로) 또는 **600 x 1024** (세로)
- PNG 또는 JPEG

**10인치 태블릿 (최소 1개, 최대 8개)**
- 크기: **1280 x 800** 픽셀 (가로) 또는 **800 x 1280** (세로)

**스크린샷 제작 팁:**
1. 실제 태블릿에서 앱 실행 후 스크린샷 캡처
2. 또는 에뮬레이터에서 캡처
3. 주요 기능 화면 포함:
   - 홈/대시보드 화면
   - 일정 만들기 화면
   - 활동 관리 화면
   - 프로필 화면

#### 기능 그래픽 (선택)
- **1024 x 500** 픽셀
- 앱의 주요 기능을 보여주는 배너

### 6.4 콘텐츠 등급

1. **콘텐츠 등급 설문** 완료
2. **모든 연령** 또는 **3세 이상** 선택
3. 설문 결과에 따라 등급 자동 할당

### 6.5 개인정보 보호 및 보안

#### 개인정보 처리방침 (필수)
- URL 제공 또는 앱 내 텍스트
- 현재 앱은 개인정보를 수집하지 않으므로 간단한 정책 작성

**예시 URL:**
```
https://yourwebsite.com/privacy
```

또는 앱 내 텍스트로 제공 가능 (이미 구현됨)

#### 데이터 보안
- **데이터 수집**: 아니요 (현재 버전)
- **데이터 공유**: 아니요
- **데이터 암호화**: 예 (기기 내 저장)

### 6.6 앱 액세스 권한

현재 앱이 요청하는 권한:
- **알림** (선택적)
- **파일 저장** (백업/복원 기능용)

권한 설명 작성:
- 각 권한의 사용 목적 명시

---

## 7. 앱 심사 제출

### 7.1 최종 점검

제출 전 확인사항:

- [ ] 앱 정보 모두 입력 완료
- [ ] 스크린샷 업로드 완료 (최소 1개)
- [ ] 앱 아이콘 업로드 완료
- [ ] 앱 설명 작성 완료
- [ ] 콘텐츠 등급 완료
- [ ] 개인정보 처리방침 제공
- [ ] AAB 파일 업로드 완료
- [ ] 테스트 완료 (실제 태블릿에서)

### 7.2 심사 제출

1. **Play Console** > **내 앱** > **프로덕션**
2. 모든 필수 항목이 ✅ 체크되어 있는지 확인
3. **"앱 출시"** 또는 **"심사 제출"** 버튼 클릭
4. 확인 다이얼로그에서 제출 확인

### 7.3 심사 프로세스

**심사 소요 시간:**
- 일반적으로 **1-3일** 소요
- 첫 출시는 더 오래 걸릴 수 있음 (최대 7일)

**심사 상태:**
1. ⏳ **심사 대기 중** - 제출 완료, 심사 대기
2. 🔍 **심사 중** - Google이 앱 검토 중
3. ✅ **승인됨** - 심사 통과, 출시 완료
4. ❌ **거부됨** - 문제 발견, 수정 필요
5. 🚀 **출시됨** - Play Store에서 사용 가능

**심사 거부 시:**
- Google에서 거부 사유 안내
- 문제 수정 후 다시 제출
- Play Console에서 소통

---

## 📱 태블릿 전용 앱 주의사항

### Play Store 설정

1. **기기 호환성**
   - Play Console에서 **"태블릿만"** 선택
   - 또는 최소 화면 크기 설정

2. **앱 설명에 명시**
   - "태블릿 전용 앱입니다"
   - "스마트폰에서는 실행되지 않을 수 있습니다"

3. **스크린샷**
   - 태블릿 화면 비율로 제작
   - 가로/세로 모드 모두 포함 권장

---

## 🚀 빠른 시작 체크리스트

### 필수 준비물
- [ ] Google Play Console 계정 ($25)
- [ ] EAS 계정 (무료 가능)
- [ ] 앱 아이콘 512x512
- [ ] 스크린샷 (최소 1개)
- [ ] 앱 설명 (한국어)
- [ ] 개인정보 처리방침 URL

### 프로젝트 설정
- [ ] app.json 설정 완료
- [ ] eas.json 생성
- [ ] EAS 프로젝트 초기화
- [ ] Package Name 확인

### 빌드 및 업로드
- [ ] EAS 빌드 성공
- [ ] Play Store Connect에 업로드 완료

### Play Store Connect
- [ ] 앱 정보 입력 완료
- [ ] 스크린샷 업로드 완료
- [ ] 앱 설명 작성 완료
- [ ] 콘텐츠 등급 완료

### 제출
- [ ] 모든 필수 항목 완료 확인
- [ ] 심사 제출 완료
- [ ] 심사 결과 대기

---

## ⏱️ 예상 소요 시간

| 단계 | 예상 시간 |
|------|----------|
| Google Play Console 가입 | 10분 |
| 프로젝트 설정 | 30분 |
| 이미지 준비 | 1-2일 |
| Play Store 정보 작성 | 1일 |
| 빌드 및 업로드 | 2-3시간 |
| Play Store Connect 설정 | 1일 |
| 심사 대기 | 1-3일 |
| **총계** | **약 4-7일** |

---

## 💡 비용 절감 팁

### Apple vs Google 비교

| 항목 | Apple | Google |
|------|-------|--------|
| 개발자 계정 | $99/년 | $25 (일회성) |
| 첫 출시 | 더 엄격한 심사 | 상대적으로 빠름 |
| 업데이트 | 심사 필요 | 자동 승인 가능 |

### Android 먼저 런칭의 장점

1. **비용 절감**: $25 vs $99/년
2. **빠른 출시**: 심사가 상대적으로 빠름
3. **테스트 용이**: 다양한 기기에서 테스트 가능
4. **수익 확인**: 사용자 반응 확인 후 iOS 출시 결정 가능

---

## 🔗 유용한 링크

- [Google Play Console](https://play.google.com/console/)
- [Expo EAS](https://expo.dev/)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [Play Store 정책](https://play.google.com/about/developer-content-policy/)

---

## ⚠️ 주의사항

1. **Package Name은 변경 불가**: 처음 설정한 Package Name은 변경할 수 없습니다.
2. **태블릿 전용**: 스마트폰 사용자는 설치할 수 없습니다.
3. **심사 지침 준수**: Play Store 정책을 반드시 확인하세요.
4. **개인정보 처리방침**: 개인정보를 수집하지 않더라도 URL 제공이 필요할 수 있습니다.
5. **테스트 필수**: 실제 태블릿에서 충분히 테스트한 후 제출하세요.

---

## 📞 지원

문제가 발생하면:
1. [Expo 문서](https://docs.expo.dev/) 확인
2. [Google Play Console 도움말](https://support.google.com/googleplay/android-developer/) 검색
3. EAS Support: support@expo.dev

---

**작성일**: 2025-01-XX  
**최종 업데이트**: 2025-01-XX
