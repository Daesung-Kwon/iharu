/**
 * 시스템 기본 8개 활동 데이터
 */

import { Activity } from '../types';
import { DefaultActivityEmojis } from './emojis';

export const DEFAULT_ACTIVITIES: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: null,
    childProfileId: null,
    name: '숙제하기',
    emojiKey: 'homework',
    colorKey: 'blue',
    durationMinutes: 30,
    category: 'study',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '책 읽기',
    emojiKey: 'reading',
    colorKey: 'purple',
    durationMinutes: 30,
    category: 'reading',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '놀이 시간',
    emojiKey: 'play',
    colorKey: 'pink',
    durationMinutes: 60,
    category: 'play',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '운동하기',
    emojiKey: 'exercise',
    colorKey: 'green',
    durationMinutes: 30,
    category: 'exercise',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '그림 그리기',
    emojiKey: 'art',
    colorKey: 'orange',
    durationMinutes: 40,
    category: 'art',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '음악 연습',
    emojiKey: 'music',
    colorKey: 'yellow',
    durationMinutes: 30,
    category: 'music',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '간식 먹기',
    emojiKey: 'snack',
    colorKey: 'red',
    durationMinutes: 20,
    category: 'meal',
    isDefault: true,
  },
  {
    userId: null,
    childProfileId: null,
    name: '낮잠 자기',
    emojiKey: 'nap',
    colorKey: 'teal',
    durationMinutes: 60,
    category: 'rest',
    isDefault: true,
  },
];


