# Android expo-dev-client 크래시 해결 가이드

## 오류 메시지
```
java.lang.IllegalArgumentException: App react context shouldn't be created before
```

## 원인
Expo Dev Client(Dev Launcher)가 Android에서 앱 시작 시 React context 초기화 타이밍 문제로 크래시합니다.  
Expo GitHub [#35385](https://github.com/expo/expo/issues/35385)에서 보고된 이슈입니다.

---

## 해결 방법

### 1. Metro를 먼저 실행 후 앱 실행 (가장 효과적)
1. 터미널에서 `npx expo start` 또는 `npm start` 실행
2. **"Metro waiting on..."** 메시지가 나올 때까지 대기
3. 그 후 기기에서 앱 아이콘을 눌러 실행 (또는 `a` 키)
4. `a` 키로 앱 실행 시 **바로 연타하지 말고**, Metro 준비 후 1~2초 뒤에 한 번만 누르기

### 2. 크래시 시 재실행
- 앱이 크래시하면 **완전히 종료** 후 다시 실행
- 일부 사용자: "두 번째 실행에서는 정상 동작"한다고 보고

### 3. 클린 빌드 (이미 적용됨)
```bash
npx expo prebuild --clean --platform android
cd android && ./gradlew clean
cd .. && npx expo run:android
```

### 4. 캐시 초기화
```bash
# node_modules, 캐시 삭제
rm -rf node_modules
rm -rf android
npm cache clean --force
npm install
npx expo prebuild --clean
npx expo run:android
```

---

## 프로덕션 빌드 시 참고
- `expo-dev-client`는 **개발 빌드**에만 포함됨
- EAS Build의 **production 프로필**로 만든 앱에는 Dev Client가 없어 이 크래시가 발생하지 않음
- 실제 배포 앱은 정상 동작합니다.
