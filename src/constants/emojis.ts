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

// Icons: see activityIcons.ts. Emoji characters stay here so legacy saves
// that stored the character (instead of the preset key) still resolve.


