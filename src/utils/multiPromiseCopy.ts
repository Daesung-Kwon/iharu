/** Parent-facing copy for several weekly promises. */
export const MULTI_PROMISE_COPY = {
  listIntro: '할 일은 아이가 정해요. 약속마다 보상과 목표를 따로 정할 수 있어요.',
  add: '약속 더하기',
  back: '목록으로',
  newTitle: '새 약속',
  editTitle: '약속 고치기',
  expandLink: '보상 확장으로 약속을 더 만들 수 있어요',
  limitTitle: '약속을 더 만들 수 없어요',
  limitBody: (limit: number) => `지금은 약속을 ${limit}개까지 만들 수 있어요.`,
  slots: (used: number, limit: number) => `약속 ${used}개 / ${limit}개`,
  rowMany: (n: number) => `약속 ${n}개`,
} as const;
