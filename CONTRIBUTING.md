# 기여 가이드 (Contributing Guide)

i하루 프로젝트에 기여해주셔서 감사합니다! 🎉

이 문서는 프로젝트에 기여하는 방법을 안내합니다.

---

## 📋 목차

- [행동 강령](#행동-강령)
- [기여 방법](#기여-방법)
- [개발 환경 설정](#개발-환경-설정)
- [코딩 스타일](#코딩-스타일)
- [커밋 메시지 규칙](#커밋-메시지-규칙)
- [Pull Request 프로세스](#pull-request-프로세스)

---

## 📜 행동 강령

이 프로젝트는 모든 기여자에게 열려있으며, 우리는 모든 참여자가 즐겁고 환영받는 경험을 하기를 기대합니다.

### 우리의 약속

- 친절하고 포용적인 언어 사용
- 서로 다른 관점과 경험 존중
- 건설적인 피드백 수용
- 커뮤니티에 집중

---

## 🤝 기여 방법

### 버그 리포트

버그를 발견하셨나요?

1. [GitHub Issues](https://github.com/Daesung-Kwon/iharu/issues)에서 기존 이슈 확인
2. 새 이슈 생성
3. 다음 정보 포함:
   - 버그 설명
   - 재현 단계
   - 예상 동작 vs 실제 동작
   - 스크린샷 (가능한 경우)
   - 환경 정보 (OS, 기기, 앱 버전)

### 기능 제안

새로운 기능 아이디어가 있으신가요?

1. [GitHub Discussions](https://github.com/Daesung-Kwon/iharu/discussions)에서 토론 시작
2. 또는 [GitHub Issues](https://github.com/Daesung-Kwon/iharu/issues)에 기능 요청 생성
3. 다음 정보 포함:
   - 기능 설명
   - 사용 사례
   - 예상되는 이점

### 코드 기여

코드로 기여하고 싶으신가요?

1. 저장소 Fork
2. Feature 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성

---

## 🛠️ 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/Daesung-Kwon/iharu.git
cd iharu
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm start
```

### 4. 브랜치 생성

```bash
# 메인 브랜치에서 최신 코드 가져오기
git checkout main
git pull origin main

# 새 브랜치 생성
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/your-bug-fix
```

---

## 💻 코딩 스타일

### TypeScript

- TypeScript를 사용합니다
- 타입을 명시적으로 정의합니다
- `any` 타입 사용을 피합니다

### 컴포넌트 구조

```typescript
// 1. Import 문
import React from 'react';
import { View, Text } from 'react-native';

// 2. 타입 정의
interface Props {
  title: string;
}

// 3. 컴포넌트
export default function MyComponent({ title }: Props) {
  // 4. 상태 및 훅
  const [state, setState] = useState();

  // 5. 함수
  const handlePress = () => {
    // ...
  };

  // 6. 렌더링
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}

// 7. 스타일
const styles = StyleSheet.create({
  // ...
});
```

### 네이밍 규칙

- **컴포넌트**: PascalCase (`ActivityCard.tsx`)
- **함수/변수**: camelCase (`handlePress`, `userName`)
- **상수**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **타입/인터페이스**: PascalCase (`ScheduleItem`)

### 파일 구조

- 컴포넌트는 `src/components/`에
- 화면은 `src/screens/`에
- 서비스는 `src/services/`에
- 타입은 `src/types/`에

---

## 📝 커밋 메시지 규칙

커밋 메시지는 명확하고 일관성 있게 작성해주세요.

### 형식

```
<type>: <subject>

<body> (선택사항)

<footer> (선택사항)
```

### Type

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

### 예시

```
feat: 활동 카드에 드래그 앤 드롭 기능 추가

- DraggableActivityCard 컴포넌트 구현
- react-native-draggable-flatlist 통합
- 드롭 존 시각적 피드백 추가

Closes #123
```

---

## 🔄 Pull Request 프로세스

### 1. PR 생성 전 확인사항

- [ ] 코드가 프로젝트 스타일 가이드를 따름
- [ ] 새로운 기능에 대한 테스트 추가 (가능한 경우)
- [ ] 문서 업데이트 (필요한 경우)
- [ ] 커밋 메시지가 규칙을 따름
- [ ] 코드가 정상 작동함

### 2. PR 제목

명확하고 간결한 제목을 사용하세요:

```
feat: 다국어 지원 추가
fix: 타임라인 드래그 앤 드롭 버그 수정
```

### 3. PR 설명

다음 정보를 포함해주세요:

- 변경사항 설명
- 관련 이슈 번호 (있는 경우)
- 스크린샷 (UI 변경인 경우)
- 테스트 방법

### 4. 리뷰 프로세스

- 모든 PR은 리뷰를 거칩니다
- 피드백이 있으면 수정해주세요
- 승인 후 메인 브랜치에 병합됩니다

---

## 🧪 테스트

### 실행 방법

```bash
# 타입 체크
npm run type-check

# 린트 (추가 예정)
npm run lint
```

### 테스트 작성 (향후 추가 예정)

- 단위 테스트
- 통합 테스트
- E2E 테스트

---

## 📚 추가 자료

- [React Native 문서](https://reactnative.dev/docs/getting-started)
- [Expo 문서](https://docs.expo.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)

---

## ❓ 질문이 있으신가요?

- [GitHub Discussions](https://github.com/Daesung-Kwon/iharu/discussions)에서 질문하세요
- [GitHub Issues](https://github.com/Daesung-Kwon/iharu/issues)에 이슈를 생성하세요

---

**감사합니다! 여러분의 기여가 i하루를 더 나은 앱으로 만듭니다.** 🙏
