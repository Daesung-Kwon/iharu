# Play Console에서 브라우저로 확인할 항목

Play Console을 열거나 값을 바꾸지 않고, 화면을 넘겨 받아 확인할 때 쓰는 목록이다. 항목마다 상태만 적고, 변경은 별도 승인 뒤에 한다.

계정·앱

- [ ] 개발자 계정이 개인인지 조직인지, 생성일이 2023-11-13 이후인지 (12×14 규칙 적용 여부)
- [ ] 신원 확인(Identity verification) 완료 여부
- [ ] 결제 프로필 / 판매자 계정 상태 (IAP를 팔려면 필요)
- [ ] 패키지 `com.iharu.app` 앱이 보이는지, 앱 상태(초안 / 테스트 / 프로덕션 액세스 거부 등)
- [ ] 2026 패키지 이름 등록·개발자 확인 경고가 있는지

테스트 트랙

- [ ] 내부 테스트(internal)에 올라간 AAB가 있는지, versionCode / versionName / targetSdk
- [ ] 비공개 테스트(closed) 트랙이 있는지, 심사 상태
- [ ] 비공개 테스터 **opt-in** 인원 (이메일만 등록한 사람은 제외)
- [ ] 12명 이상이 신청 직전 14일 동안 연속 참여 중인지
- [ ] 대시보드에 「프로덕션 액세스 신청」 버튼이 있는지
- [ ] 예전 참여 링크 `https://play.google.com/apps/testing/com.iharu.app`가 아직 유효한지

스토어 리스팅

- [ ] 앱 이름, 짧은 설명, 전체 설명. 「태블릿 전용」 문구가 남아 있지 않은지
- [ ] 카테고리 (초안: Education, App Store와 동일)
- [ ] 그래픽: 512×512 아이콘, 폰 세로 샷, 7"·10" 태블릿 샷, 선택 기능 그래픽
- [ ] 기기 카탈로그에 **phone form factor**가 포함돼 있는지
- [ ] 기본 언어 한국어, 배포 국가

앱 콘텐츠 선언

- [ ] 개인정보처리방침 URL이 `https://iharu.wodybody.com/privacy.html` 인지
- [ ] Data safety 제출 상태 (초안: `DATA_SAFETY.md`)
- [ ] 광고 선언: 광고 없음
- [ ] 대상 연령 / Families (초안: `FAMILIES-AND-DECLARATIONS.md`)
- [ ] 콘텐츠 등급 설문
- [ ] 앱 액세스(로그인 없음 — 데모 계정 불필요)
- [ ] 민감 권한 선언: `SCHEDULE_EXACT_ALARM`(이 PR 이후), 알림. `USE_EXACT_ALARM`은 없어야 함
- [ ] 뉴스·금융 등 해당 없는 카테고리 선언

수익화

- [ ] 인앱 상품 `com.dailyschedule.app.reward_expansion` 존재·가격(초안 ₩1,500)·상태
- [ ] 유료 앱 / 인앱 결제 계약, 세금·결제 보류 항목

정책 상태

- [ ] Policy status 경고(target API, Billing Library, Families, 권한)
- [ ] 업로드된 최신 AAB의 targetSdk와 Play Billing 버전
