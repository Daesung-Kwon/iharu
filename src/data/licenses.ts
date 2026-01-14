/**
 * 오픈소스 라이센스 및 폰트 정보
 */

export interface LicenseInfo {
  name: string;
  version?: string;
  license: string;
  url?: string;
  description?: string;
}

export const OPEN_SOURCE_LICENSES: LicenseInfo[] = [
  {
    name: 'React',
    version: '19.1.0',
    license: 'MIT',
    url: 'https://react.dev',
    description: '사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리'
  },
  {
    name: 'React Native',
    version: '0.81.5',
    license: 'MIT',
    url: 'https://reactnative.dev',
    description: '네이티브 모바일 앱을 구축하기 위한 프레임워크'
  },
  {
    name: 'Expo',
    version: '54.0.29',
    license: 'MIT',
    url: 'https://expo.dev',
    description: 'React Native 앱 개발을 위한 플랫폼 및 도구 모음'
  },
  {
    name: 'React Navigation',
    version: '7.x',
    license: 'MIT',
    url: 'https://reactnavigation.org',
    description: 'React Native 앱을 위한 라우팅 및 네비게이션 라이브러리'
  },
  {
    name: '@tanstack/react-query',
    version: '5.x',
    license: 'MIT',
    url: 'https://tanstack.com/query',
    description: '서버 상태 관리 라이브러리'
  },
  {
    name: 'date-fns',
    version: '3.6.0',
    license: 'MIT',
    url: 'https://date-fns.org',
    description: '날짜 유틸리티 라이브러리'
  },
  {
    name: 'Lottie React Native',
    version: '7.3.4',
    license: 'Apache-2.0',
    url: 'https://airbnb.io/lottie',
    description: 'After Effects 애니메이션을 React Native에서 사용'
  },
  {
    name: 'React Native Gesture Handler',
    version: '2.28.0',
    license: 'MIT',
    url: 'https://github.com/software-mansion/react-native-gesture-handler',
    description: '네이티브 제스처 인식 라이브러리'
  },
  {
    name: 'React Native Reanimated',
    version: '4.1.6',
    license: 'MIT',
    url: 'https://github.com/software-mansion/react-native-reanimated',
    description: '고성능 애니메이션 라이브러리'
  },
  {
    name: 'React Native Draggable FlatList',
    version: '4.0.3',
    license: 'MIT',
    url: 'https://github.com/computerjazz/react-native-draggable-flatlist',
    description: '드래그 앤 드롭 가능한 FlatList 컴포넌트'
  },
  {
    name: '@react-native-async-storage/async-storage',
    version: '2.2.0',
    license: 'MIT',
    url: 'https://github.com/react-native-async-storage/async-storage',
    description: '비동기 로컬 스토리지'
  },
  {
    name: '@expo/vector-icons',
    version: '15.0.3',
    license: 'MIT',
    url: 'https://github.com/expo/vector-icons',
    description: '아이콘 라이브러리 모음'
  },
];

export const FONT_LICENSES: LicenseInfo[] = [
  {
    name: 'BMJUA (배달의민족 주아체)',
    license: 'SIL Open Font License 1.1',
    url: 'https://www.woowahan.com/#/fonts',
    description: '배달의민족에서 제공하는 무료 한글 폰트. 개인 및 기업 사용 가능.'
  },
];

export const LICENSE_TEXT = `
이 앱은 다음과 같은 오픈소스 소프트웨어를 사용합니다:

${OPEN_SOURCE_LICENSES.map(lib => 
  `• ${lib.name}${lib.version ? ` (${lib.version})` : ''} - ${lib.license}`
).join('\n')}

${FONT_LICENSES.map(font => 
  `• ${font.name} - ${font.license}`
).join('\n')}

각 오픈소스의 라이센스는 해당 프로젝트의 저장소에서 확인하실 수 있습니다.
`;
