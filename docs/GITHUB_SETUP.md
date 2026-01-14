# GitHub 저장소 설정 가이드

프로젝트를 GitHub에 등록하고 관리하는 방법입니다.

---

## 🚀 빠른 시작

### 1단계: Git 저장소 초기화

```bash
cd /Users/malife/daily-schedule-app

# Git 초기화
git init

# 원격 저장소 추가
git remote add origin https://github.com/Daesung-Kwon/iharu.git
```

### 2단계: 파일 추가 및 커밋

```bash
# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "feat: 초기 프로젝트 설정 및 런칭 준비

- i하루 앱 v1.0.0 런칭 준비 완료
- Android 태블릿 전용 앱
- 주요 기능 구현 완료
- 문서화 완료"
```

### 3단계: GitHub에 푸시

```bash
# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

---

## 📋 커밋 전 확인사항

### .gitignore 확인

다음 파일들이 제외되는지 확인:
- `node_modules/`
- `.expo/`
- `build/`
- `.env` 파일들
- 빌드 아티팩트 (`.apk`, `.aab`, `.ipa`)

### 커밋할 파일 확인

```bash
# 추가될 파일 확인
git status

# 특정 파일 제외 확인
git status --ignored
```

---

## 🔄 일반적인 워크플로우

### 새 기능 개발

```bash
# 최신 코드 가져오기
git checkout main
git pull origin main

# 새 브랜치 생성
git checkout -b feature/new-feature

# 작업 후 커밋
git add .
git commit -m "feat: 새 기능 추가"

# GitHub에 푸시
git push origin feature/new-feature

# Pull Request 생성 (GitHub 웹사이트에서)
```

### 버그 수정

```bash
# 버그 수정 브랜치 생성
git checkout -b fix/bug-description

# 수정 후 커밋
git add .
git commit -m "fix: 버그 설명"

# 푸시 및 PR 생성
git push origin fix/bug-description
```

---

## 📝 커밋 메시지 규칙

### 형식

```
<type>: <subject>

<body> (선택사항)
```

### Type

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드/설정 변경

### 예시

```
feat: 활동 카드 드래그 앤 드롭 기능 추가

- DraggableActivityCard 컴포넌트 구현
- react-native-draggable-flatlist 통합
- 드롭 존 시각적 피드백 추가
```

---

## 🔐 GitHub 인증

### Personal Access Token 사용

1. GitHub > Settings > Developer settings > Personal access tokens
2. "Generate new token" 클릭
3. `repo` 권한 선택
4. 토큰 생성 및 복사
5. 푸시 시 토큰을 비밀번호로 사용

### SSH 키 사용 (권장)

```bash
# SSH 키 생성 (아직 없다면)
ssh-keygen -t ed25519 -C "your_email@example.com"

# SSH 키를 GitHub에 추가
# GitHub > Settings > SSH and GPG keys > New SSH key
```

---

## 📚 추가 자료

- [Git 기본 가이드](https://git-scm.com/book)
- [GitHub 가이드](https://guides.github.com/)
- [커밋 메시지 규칙](https://www.conventionalcommits.org/)

---

## ⚠️ 주의사항

### 커밋하지 말아야 할 것

- 개인 정보 (API 키, 비밀번호 등)
- 빌드 아티팩트
- `node_modules/`
- 환경 변수 파일 (`.env`)

### .gitignore 확인

커밋 전에 `.gitignore`가 제대로 설정되어 있는지 확인하세요.
