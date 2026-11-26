# i하루 앱 — Google Play Store 런칭 가이드

> 최종 업데이트: 2026-11-26 (Asia/Seoul). 상세 블로커·초안은 `docs/store-play/`를 따른다.

이 문서는 예전에 「가입 후 수일 안에 프로덕션 제출」처럼 적혀 있었다. 2023-11-13 이후 개인 개발자 계정에는 **비공개 테스트 12명 × 14일**이 필요할 수 있고, 2026-08-31부터는 **target API 36**과 **Play Billing 8+**가 필수다. 광고는 제거되었고 패키지는 `com.iharu.app`로 고정이다.

## 지금 바로 하지 않는 것

- Play Console 값 변경, AAB 업로드, 심사·프로덕션 제출
- 테스터에게 연락, 지출, 서비스 계정 키 생성

## 고정값

- 앱 이름: i하루
- 패키지: `com.iharu.app` (변경 불가)
- iOS 번들: `com.dailyschedule.app` (다름, 정상)
- 버전 문자열: 1.1.1 (iOS와 맞춤)
- 개인정보처리방침: https://iharu.wodybody.com/privacy.html
- IAP SKU: `com.dailyschedule.app.reward_expansion` (일회성, 초안 ₩1,500)
- EAS 프로젝트: `31a89f46-760d-491d-8ba6-a3ffda29ad8d` (owner `ds.kwon`)
- production 빌드: AAB (`eas.json` `buildType: app-bundle`)
- `eas submit` 기본 트랙: `internal` (12×14 요건에 포함되지 않음). 비공개 테스트 트랙 업로드는 별도 승인

## 권장 순서

1. 이 Draft의 권한·SDK 고정과 문서 초안을 머지(실기기·에뮬 확인 후, 승인 카드).
2. Play Console을 브라우저로 점검 (`docs/store-play/CHECKLIST.md`). 12×14 적용 여부를 여기서 확정.
3. Data safety · 대상 연령 · 스토어 문구를 초안대로 입력 (승인 카드, 본인확인·결제는 사용자 직접 입력).
4. 승인 후 EAS production AAB를 만들고, 먼저 내부 또는 비공개 테스트 트랙에 올린다. 프로덕션이 아니다.
5. 개인 계정 규칙이 적용되면 테스터 12명이 14일 연속 참여한 뒤에만 프로덕션 액세스를 신청한다.
6. 소개 사이트의 「출시 준비 중」은 프로덕션 공개 승인 후에만 Play 배지로 바꾼다.

명령 참고 (실행은 승인 후):

```bash
# 읽기 전용
eas whoami
eas build:list --platform android --non-interactive

# 승인 후에만
eas build --profile production --platform android
# 업로드는 Console 수동 또는 승인된 eas submit (현재 track: internal)
```

## 관련 문서

- [감사와 블로커](./store-play/AUDIT-2026-11-26.md)
- [Console 체크리스트](./store-play/CHECKLIST.md)
- [Data safety 초안](./store-play/DATA_SAFETY.md)
- [Families · 선언 초안](./store-play/FAMILIES-AND-DECLARATIONS.md)
- [유니버설·스크린샷](./MOBILE_EXPANSION.md)
