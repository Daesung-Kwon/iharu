# Families · 대상 연령 · 기타 선언 초안

작성일: 2026-11-26 (Asia/Seoul). Play Console에 입력하지 않음.

## 권장안 (사용자 확인 필요)

2026-10-16 확정: 초등 3–6학년, 아이 주도, 부모는 보상·구매만, 광고 없음, 한국 우선.

Play 대상 연령 권장:

- **선택:** 만 6–8세, 만 9–12세
- **선택하지 않음 (권장):** 만 5세 이하(미취학용으로 설계되지 않음), 만 13–15 / 16–17 / 18세 이상

이렇게 하면 아동이 대상에 포함되어 **Families 정책이 적용**된다. 광고가 없으므로 인증 광고 SDK·연령 확인 화면은 필요 없다. 부모가 설정·PIN·구매를 하더라도, 앱의 주 사용자는 아이이므로 「모든 연령」으로 넓히지 않는 편이 정책 설명과 맞다.

다른 선택지 (결정 필요):

- 부모를 명시적으로 포함하려면 만 18세 이상을 추가한다. 이 경우 혼합 대상이 되어, 광고를 다시 넣을 일이 생기면 중립 연령 화면이 필요하다. 지금은 광고가 없어도 선언을 더 넓히는 부담이 있다.

Teacher Approved: 나중에 선택. 지금은 신청하지 않는다.

## 광고

- 앱에 광고가 있는가? **아니요.**
- AdMob / 광고 SDK / `AD_ID` 없음.

## 앱 카테고리

- 권장: **Education** (App Store Primary Education과 맞춤). 예전 가이드의 Productivity는 쓰지 않는다.
- 태그 초안: 일정관리, 일과표, 스케줄, 교육

## 콘텐츠 등급

설문은 사용자가 Play Console IARC 양식에 직접 답한다. 초안 의도:

- 폭력, 성적 콘텐츠, 언어, 통제된 물질, 도박: 없음
- 사용자 간 소통 / UGC / 위치 공유 / 데이팅: 없음
- 인앱 결제: 있음 (부모가 한 번 사는 「보상 확장」). 아동이 실수로 사지 않게 PIN/부모 확인이 있는지를 설문 문장에 맞춰 솔직히 답한다.
- 결과 목표는 낮은 연령 등급 (Everyone / 3+에 해당).

## 정확한 알람 선언 (이 PR 이후 빌드)

- `USE_EXACT_ALARM`: 선언하지 않음 (차단).
- `SCHEDULE_EXACT_ALARM`: 일정 시작 전 로컬 알림을 위해 선언. 사용자가 「알람 및 알림」 특수 권한을 켜야 정확한 시각에 울린다. 꺼져 있으면 시스템이 약간 늦춰 전달할 수 있다.
- Play 선언이 뜨면: 핵심 기능은 어린이 일정 알림이며, 자동 부여 권한이 아니라 사용자 부여 권한을 쓴다고 적는다.

## 스토어 설명 초안 (유니버설, 태블릿 전용 문구 금지)

짧은 설명 (80자 이내):

```
아이가 스스로 하루 일과를 계획하고 체크하는 일정 앱. 스마트폰과 태블릿에서 쓸 수 있어요.
```

전체 설명 요지:

- 아이 주도 일정, 부모가 보상만 정함
- 활동 / 일정 만들기 / 오늘 / 알림
- 데이터는 기기에만 저장
- 스마트폰 + 태블릿 유니버설
- 광고 없음

## 심사 메모 초안 (유니버설 전환)

```
This is a universal phone + tablet build of the existing app (package com.iharu.app).
It is not a new listing. User data stays on the device; nothing is migrated or reset.
There are no ads and no account or server. The optional one-time in-app product is
com.dailyschedule.app.reward_expansion (reward expansion for parents).
Phone layouts are compact (shortest side < 768). Tablets keep the current layout.
```
