/**
 * 앱에서 사용하는 이모지 프리셋
 * 14가지 이모지 아이콘 선택 가능
 */

export const ActivityEmojis: Record<string, string> = {
  homework: '📝',
  reading: '📚',
  play: '🎮',
  exercise: '🏃',
  art: '🎨',
  music: '🎵',
  meal: '🍎',
  snack: '🍪',
  nap: '😴',
  study: '✏️',
  friend: '👫',
  outside: '🌳',
  roleplay: '🎭',
  rest: '🧘',
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


