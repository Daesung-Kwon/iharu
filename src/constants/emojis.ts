/**
 * 앱에서 사용하는 이모지 프리셋
 * 다양한 활동 유형 선택 가능
 */

export const ActivityEmojis: Record<string, string> = {
  // 학습·독서
  homework: '📝',
  reading: '📚',
  study: '✏️',
  science: '🔬',
  math: '➕',
  // 놀이·창작
  play: '🎮',
  art: '🎨',
  music: '🎵',
  piano: '🎹',
  dance: '💃',
  puzzle: '🧩',
  roleplay: '🎭',
  movie: '🎬',
  // 운동·활동
  exercise: '🏃',
  swim: '🏊',
  bike: '🚴',
  outside: '🌳',
  // 일상
  meal: '🍎',
  snack: '🍪',
  nap: '😴',
  rest: '🧘',
  // 사회·기타
  friend: '👫',
  pets: '🐕',
  garden: '🌻',
  travel: '✈️',
  computer: '💻',
  camera: '📷',
  lightbulb: '💡',
};

// 기본 8개 활동에 사용할 이모지 매핑
export const DefaultActivityEmojis = {
  homework: ActivityEmojis.homework,
  reading: ActivityEmojis.reading,
  play: ActivityEmojis.play,
  exercise: ActivityEmojis.exercise,
  art: ActivityEmojis.art,
  music: ActivityEmojis.music,
  snack: ActivityEmojis.snack,
  nap: ActivityEmojis.nap,
};

// 이모지 목록 (선택 UI용)
export const EmojiList = Object.entries(ActivityEmojis).map(([key, emoji]) => ({
  key,
  emoji,
}));

/** 이모지 키 → Material Icons 매핑 (아이콘 탭용) */
export const EmojiToMaterialIcon: Record<string, string> = {
  // 학습·독서
  homework: 'edit-document',
  reading: 'menu-book',
  study: 'school',
  science: 'science',
  math: 'calculate',
  // 놀이·창작
  play: 'sports-esports',
  art: 'palette',
  music: 'music-note',
  piano: 'piano',
  dance: 'celebration',
  puzzle: 'extension',
  roleplay: 'theater-comedy',
  movie: 'movie-creation',
  // 운동·활동
  exercise: 'directions-run',
  swim: 'pool',
  bike: 'directions-bike',
  outside: 'park',
  // 일상
  meal: 'restaurant',
  snack: 'cookie',
  nap: 'bedtime',
  rest: 'self-improvement',
  // 사회·기타
  friend: 'groups',
  pets: 'pets',
  garden: 'local-florist',
  travel: 'flight',
  computer: 'computer',
  camera: 'photo-camera',
  lightbulb: 'lightbulb',
};


